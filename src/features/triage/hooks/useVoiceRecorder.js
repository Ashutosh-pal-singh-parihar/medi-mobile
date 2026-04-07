import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [audioBase64, setAudioBase64] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const recordingRef = useRef(null);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        return true;
      } else {
        Alert.alert(
          'Microphone Permission Required',
          'Please allow microphone access in Settings to use voice input.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const hasPermission = permissionGranted || await requestPermission();
      if (!hasPermission) return;

      // Reset any existing recording
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }

      setAudioUri(null);
      setAudioBase64(null);

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.error('startRecording error:', err);
      Alert.alert('Recording Error', 'Could not start recording. Please try again.');
    }
  }, [permissionGranted, requestPermission]);

  const stopRecording = useCallback(async () => {
    try {
      if (!recordingRef.current) return null;
      setIsRecording(false);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) return null;
      setAudioUri(uri);

      // Convert to base64 for API
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setAudioBase64(base64);
      return { uri, base64 };
    } catch (err) {
      console.error('stopRecording error:', err);
      return null;
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
      setIsRecording(false);
      setAudioUri(null);
      setAudioBase64(null);
    } catch (err) {
      console.error('cancelRecording error:', err);
    }
  }, []);

  return {
    isRecording,
    audioUri,
    audioBase64,
    permissionGranted,
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermission,
  };
}
