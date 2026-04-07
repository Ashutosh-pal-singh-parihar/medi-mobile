import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

async function compressIfNeeded(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  if (blob.size > MAX_SIZE_BYTES) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  }
  return uri;
}

async function uriToBase64(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // includes data:image/jpeg;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useImagePicker() {
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission Required', 'Allow camera access in Settings.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const uri = await compressIfNeeded(result.assets[0].uri);
        const base64 = await uriToBase64(uri);
        setImageUri(uri);
        setImageBase64(base64);
        return { uri, base64 };
      }
      return null;
    } catch (err) {
      console.error('openCamera error:', err);
      Alert.alert('Camera Error', 'Could not open camera. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openGallery = useCallback(async () => {
    try {
      setIsLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Gallery Permission Required', 'Allow photo library access in Settings.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const uri = await compressIfNeeded(result.assets[0].uri);
        const base64 = await uriToBase64(uri);
        setImageUri(uri);
        setImageBase64(base64);
        return { uri, base64 };
      }
      return null;
    } catch (err) {
      console.error('openGallery error:', err);
      Alert.alert('Gallery Error', 'Could not open gallery. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearImage = useCallback(() => {
    setImageUri(null);
    setImageBase64(null);
  }, []);

  return { imageUri, imageBase64, isLoading, openCamera, openGallery, clearImage };
}
