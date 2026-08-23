import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  medicationName: string;
  quantity: string;
  selected: boolean;
  imageUri?: string | null;
  onToggle: () => void;
}

export function MedicationCheckbox({ medicationName, quantity, selected, imageUri, onToggle }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity style={styles.container} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={`${medicationName}, ${quantity}, ${selected ? 'selected' : 'not selected'}`}>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>💊</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{medicationName}</Text>
        <Text style={styles.quantity}>{quantity}</Text>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: colors.card,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  quantity: {
    fontSize: 16,
    color: colors.textMuted,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeholderText: {
    fontSize: 18,
  },
});
