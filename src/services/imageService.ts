import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

export async function pickMedicineImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    const extension = asset.uri.split('.').pop() || 'jpg';
    const filename = `${Crypto.randomUUID()}.${extension}`;
    const dest = `${FileSystem.documentDirectory}${filename}`;
    
    await FileSystem.copyAsync({
      from: asset.uri,
      to: dest,
    });
    
    return dest;
  }
  
  return null;
}
