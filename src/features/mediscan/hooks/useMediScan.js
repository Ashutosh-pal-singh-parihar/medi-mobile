import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';
import { useLanguage } from '../../../hooks/useLanguage';
import { mediScanService } from '../services/mediScan.service';

export const useMediScan = () => {
  const { language } = useLanguage();
  const [status, setStatus] = useState('idle'); // idle | capturing | analyzing | result | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const compressAndAnalyze = async (uri) => {
    try {
      setStatus('analyzing');
      
      // Compress if needed (keeping pattern from project)
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }], 
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const response = await mediScanService.analyzeMedicine(
        manipResult.base64,
        language
      );

      // Handle case where Gemini couldn't identify the medicine
      if (response?.error) {
        setError(response.error);
        setStatus('error');
        return;
      }

      setResult(response);
      setStatus('result');
    } catch (err) {
      console.error('[useMediScan] Error:', err);
      setError(err.message || 'Something went wrong during analysis');
      setStatus('error');
    }
  };

  const pickImage = useCallback(async () => {
    try {
      const { status: perms } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perms !== 'granted') {
        Alert.alert('Permission needed', 'Allow gallery access to scan medicines');
        return;
      }

      setStatus('capturing');
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!pickerResult.canceled) {
        await compressAndAnalyze(pickerResult.assets[0].uri);
      } else {
        setStatus('idle');
      }
    } catch (e) {
      console.error('Pick image error:', e);
      setStatus('idle');
    }
  }, [language]);

  const takePhoto = useCallback(async () => {
    try {
      const { status: perms } = await ImagePicker.requestCameraPermissionsAsync();
      if (perms !== 'granted') {
        Alert.alert('Permission needed', 'Allow camera access to scan medicines');
        return;
      }

      setStatus('capturing');
      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!pickerResult.canceled) {
        await compressAndAnalyze(pickerResult.assets[0].uri);
      } else {
        setStatus('idle');
      }
    } catch (e) {
      console.error('Take photo error:', e);
      setStatus('idle');
    }
  }, [language]);

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  return { status, result, error, pickImage, takePhoto, reset };
};
