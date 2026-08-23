import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Modal, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { parse, isPast, format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  medicationName: string;
  quantity: string;
  status: string;
  imageUri?: string | null;
  scheduledAt?: string;
  time?: string;
  onPress?: () => void;
  onEditPress?: () => void;
  onTakePress?: () => void;
}

export function MedicationCard({ medicationName, quantity, status, imageUri, scheduledAt, time, onPress, onEditPress, onTakePress }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);
  let displayStatus = status.toUpperCase();
  let isMissed = false;

  if (status === 'upcoming' || status === 'pending') {
    let dateObj;
    if (scheduledAt) {
      dateObj = new Date(scheduledAt);
    } else if (time) {
      dateObj = parse(time, 'HH:mm', new Date());
    }
    
    if (dateObj) {
      if (isPast(dateObj)) {
        displayStatus = 'OVERDUE';
        isMissed = true;
      } else if (dateObj.getTime() > Date.now() + 5 * 60000) {
        displayStatus = 'UPCOMING';
      }
    }
  }

  const isPending = status === 'upcoming' || status === 'pending';
  const showTakeButton = isPending && displayStatus !== 'UPCOMING';

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress}>
        <TouchableOpacity onPress={() => imageUri && setModalVisible(true)}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>💊</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{medicationName}</Text>
            {onEditPress && (
              <Pressable onPress={onEditPress} style={styles.editButton} hitSlop={15}>
                <Ionicons name="pencil" size={20} color={colors.primary} />
              </Pressable>
            )}
          </View>
          <Text style={styles.quantity}>{quantity}</Text>
          
          <View style={styles.footerRow}>
            <View style={styles.statusContainer}>
              <Text style={[
                styles.status, 
                status === 'taken' && styles.statusTaken,
                isMissed && styles.statusMissed
              ]}>
                {displayStatus}
              </Text>
            </View>
            
            {showTakeButton && onTakePress && (
              <TouchableOpacity style={styles.takeButton} onPress={onTakePress}>
                <Text style={styles.takeButtonText}>TAKE</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          <ScrollView 
            contentContainerStyle={styles.scrollModal}
            maximumZoomScale={3}
            minimumZoomScale={1}
            centerContent={true}
          >
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.fullImage} resizeMode="contain" />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  placeholderText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  editButton: {
    padding: 4,
    marginLeft: 8,
  },
  quantity: {
    fontSize: 16,
    color: colors.textMuted,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  statusTaken: {
    color: colors.success,
  },
  statusMissed: {
    color: colors.danger,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  takeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  takeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  scrollModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
