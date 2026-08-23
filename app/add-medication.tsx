import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { addMedication, getMedicationById, updateMedication } from '../src/database/medicationsRepository';
import { scheduleOccurrencesForMedication } from '../src/services/medicationScheduler';
import * as Crypto from 'expo-crypto';
import { MedicationWithDoses } from '../src/types/medication';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { format, addDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function AddMedicationScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : undefined;
  
  const [name, setName] = useState('');
  const [doses, setDoses] = useState([{ time: new Date(new Date().setHours(9, 0, 0, 0)), quantity: '1' }]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingDoseIndex, setEditingDoseIndex] = useState<number | null>(null);
  
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [frequency, setFrequency] = useState<'daily'|'weekly'|'interval'>('daily');
  const [durationType, setDurationType] = useState<'continuous'|'days'|'once'>('continuous');
  const [durationDays, setDurationDays] = useState('3');
  
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getMedicationById(id).then(med => {
        if (med) {
          setName(med.name);
          setFrequency(med.frequency);
          setImageUri(med.imageUri || null);
          setStartDate(new Date(med.startDate));
          
          if (med.endDate) {
            setDurationType('days'); // roughly
            // could be 'once' if start==end, but keeping it simple
          } else {
            setDurationType('continuous');
          }
          
          if (med.doses && med.doses.length > 0) {
            const parsedDoses = med.doses.map((d: any) => {
              const [hours, minutes] = d.time.split(':');
              const dTime = new Date();
              dTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
              return {
                time: dTime,
                quantity: d.quantity
              };
            });
            setDoses(parsedDoses);
          }
        }
      });
    }
  }, [id]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate && editingDoseIndex !== null) {
      const newDoses = [...doses];
      newDoses[editingDoseIndex].time = selectedDate;
      setDoses(newDoses);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const addDose = () => {
    setDoses([...doses, { time: new Date(new Date().setHours(12, 0, 0, 0)), quantity: '1' }]);
  };

  const removeDose = (index: number) => {
    if (doses.length > 1) {
      setDoses(doses.filter((_, i) => i !== index));
    } else {
      Alert.alert('Cannot remove', 'You must have at least one time scheduled.');
    }
  };

  const updateQuantity = (index: number, text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    const newDoses = [...doses];
    newDoses[index].quantity = numericValue;
    setDoses(newDoses);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a medicine name');
      return;
    }

    if (doses.length === 0) {
      Alert.alert('Error', 'You must have at least one time scheduled.');
      return;
    }

    // Check for duplicate times
    const timeStrings = doses.map(d => format(d.time, 'HH:mm'));
    const uniqueTimes = new Set(timeStrings);
    if (uniqueTimes.size !== timeStrings.length) {
      Alert.alert('Duplicate Times', 'You cannot add the exact same time multiple times.');
      return;
    }
    
    let endDate = null;
    if (durationType === 'days') {
      const daysNum = parseInt(durationDays, 10);
      if (isNaN(daysNum) || daysNum <= 0) {
        Alert.alert('Error', 'Please enter a valid number of days.');
        return;
      }
      if (daysNum > 7) {
        Alert.alert('Limit Exceeded', 'Maximum days allowed is 7.');
        return;
      }
      endDate = addDays(startDate, daysNum).toISOString();
    } else if (durationType === 'once') {
      endDate = startDate.toISOString();
    }

    try {
      const medId = id || Crypto.randomUUID();
      
      const newMed = {
        id: medId,
        name,
        frequency,
        imageUri: imageUri || null,
        intervalDays: null,
        soundUri: null,
        startDate: startDate.toISOString(),
        endDate: endDate || null,
        active: true,
        doses: doses.map(d => ({ 
          id: Crypto.randomUUID(), 
          medicationId: medId, 
          time: format(d.time, 'HH:mm'), 
          quantity: d.quantity || '1', 
          createdAt: new Date().toISOString() 
        }))
      };

      if (id) {
        await updateMedication(newMed as any, newMed.doses, []);
      } else {
        await addMedication(newMed as any, newMed.doses, []);
      }
      
      await scheduleOccurrencesForMedication(newMed as MedicationWithDoses);

      Alert.alert('Success', `Medication ${id ? 'updated' : 'added'} successfully`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save medication');
    }
  };

  return (
    <KeyboardAwareScrollView 
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom + 16, 40) }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <Text style={styles.label}>Medicine Photo</Text>
      <View style={styles.photoContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No photo selected</Text>
            </View>
          )}
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Text style={styles.photoButtonText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>
          Medicine Name <Text style={{color: 'red'}}>*</Text>
        </Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName} 
          placeholder="e.g. Blood Pressure Tablet" 
        />

        <Text style={styles.label}>Times & Quantities</Text>
        {doses.map((dose, index) => (
          <View key={index} style={styles.doseRow}>
            <TouchableOpacity 
              style={styles.timeSelectBtn} 
              onPress={() => {
                setEditingDoseIndex(index);
                setShowTimePicker(true);
              }}
            >
              <Text style={styles.timeSelectText}>{format(dose.time, 'hh:mm a')}</Text>
            </TouchableOpacity>
            
            <TextInput 
              style={styles.doseInput} 
              value={dose.quantity} 
              onChangeText={(t) => updateQuantity(index, t)} 
              placeholder="e.g. 1" 
              keyboardType="number-pad"
            />
            
            <TouchableOpacity style={styles.removeDoseBtn} onPress={() => removeDose(index)}>
              <Ionicons name="trash-outline" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity style={styles.addDoseBtn} onPress={addDose}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.addDoseText}>Add Another Time</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity 
          style={styles.dateSelectBtn} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateSelectText}>{format(startDate, 'MMM dd, yyyy')}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.label}>Duration</Text>
        <View style={styles.durationContainer}>
          <TouchableOpacity 
            style={[styles.durationBtn, durationType === 'continuous' && styles.durationBtnActive]}
            onPress={() => setDurationType('continuous')}
          >
            <Text style={[styles.durationText, durationType === 'continuous' && styles.durationTextActive]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.durationBtn, durationType === 'days' && styles.durationBtnActive]}
            onPress={() => setDurationType('days')}
          >
            <Text style={[styles.durationText, durationType === 'days' && styles.durationTextActive]}>Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.durationBtn, durationType === 'once' && styles.durationBtnActive]}
            onPress={() => setDurationType('once')}
          >
            <Text style={[styles.durationText, durationType === 'once' && styles.durationTextActive]}>Only Once</Text>
          </TouchableOpacity>
        </View>

        {durationType === 'days' && (
          <View style={styles.daysInputContainer}>
            <Text style={styles.daysInputLabel}>Number of days (Max 7):</Text>
            <TextInput 
              style={styles.daysInput} 
              value={durationDays} 
              onChangeText={(t) => {
                 const num = t.replace(/[^0-9]/g, '');
                 if (parseInt(num, 10) > 7) {
                   setDurationDays('7');
                 } else {
                   setDurationDays(num);
                 }
              }} 
              keyboardType="number-pad"
              maxLength={1}
            />
          </View>
        )}

        {showTimePicker && editingDoseIndex !== null && (
          <DateTimePicker
            value={doses[editingDoseIndex].time}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Medicine</Text>
        </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  label: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: colors.card, padding: 16, borderRadius: 8, fontSize: 18, borderWidth: 1, borderColor: colors.border, color: colors.text },
  
  photoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  imagePreview: { width: 80, height: 80, borderRadius: 8, marginRight: 16 },
  imagePlaceholder: { width: 80, height: 80, borderRadius: 8, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  imagePlaceholderText: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  photoButtons: { flex: 1, justifyContent: 'center' },
  photoButton: { backgroundColor: colors.card, padding: 10, borderRadius: 8, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  photoButtonText: { color: colors.text, fontWeight: 'bold' },

  doseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timeSelectBtn: { backgroundColor: colors.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', flex: 1, marginRight: 12 },
  timeSelectText: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  doseInput: { backgroundColor: colors.card, padding: 16, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: colors.border, flex: 1, marginRight: 12, color: colors.text },
  removeDoseBtn: { padding: 8 },
  
  addDoseBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginBottom: 8 },
  addDoseText: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },

  dateSelectBtn: { backgroundColor: colors.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginBottom: 16 },
  dateSelectText: { fontSize: 18, fontWeight: 'bold', color: colors.primary },

  durationContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  durationBtn: { flex: 1, backgroundColor: colors.card, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  durationBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  durationText: { fontSize: 14, fontWeight: 'bold', color: colors.textMuted },
  durationTextActive: { color: '#ffffff' },

  daysInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  daysInputLabel: { fontSize: 16, color: colors.text, marginRight: 12 },
  daysInput: { flex: 1, fontSize: 18, color: colors.primary, fontWeight: 'bold' },

  saveButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16, marginBottom: 40 },
  saveText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' }
});
