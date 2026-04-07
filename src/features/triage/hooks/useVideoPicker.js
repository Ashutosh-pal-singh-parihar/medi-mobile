import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';

// Extract N evenly-spaced thumbnails from the video
async function extractKeyFrames(videoUri, durationMs, count = 5) {
  const frames = [];
  const interval = Math.floor(durationMs / (count + 1));

  for (let i = 1; i <= count; i++) {
    const timeMs = interval * i;
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: timeMs,
        quality: 0.7,
      });
      // Resize to save tokens when sending to vision AI
      const compressed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 512 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      frames.push({ uri: compressed.uri, timeMs });
    } catch (e) {
      console.warn(`Frame at ${timeMs}ms failed:`, e.message);
    }
  }
  return frames;
}

async function frameToBase64(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // data:image/jpeg;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useVideoPicker() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [frames, setFrames] = useState([]);      // { uri, timeMs, base64 }[]
  const [videoUri, setVideoUri] = useState(null);
  const [progress, setProgress] = useState('');  // status message for UI

  const pickVideo = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Allow photo library access in Settings.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        videoMaxDuration: 120, // 2 minutes max
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      setVideoUri(asset.uri);
      setIsProcessing(true);
      setProgress('Extracting key frames from video...');

      const durationMs = asset.duration ? asset.duration * 1000 : 30000;
      const extractedFrames = await extractKeyFrames(asset.uri, durationMs, 5);

      setProgress('Converting frames to text description...');

      // Convert each frame to base64
      const framesWithBase64 = await Promise.all(
        extractedFrames.map(async (frame) => ({
          ...frame,
          base64: await frameToBase64(frame.uri),
        }))
      );

      setFrames(framesWithBase64);
      setProgress('');
      setIsProcessing(false);

      return {
        videoUri: asset.uri,
        frames: framesWithBase64,
        frameCount: framesWithBase64.length,
      };
    } catch (err) {
      console.error('pickVideo error:', err);
      Alert.alert('Video Error', 'Could not process video. Please try again.');
      setIsProcessing(false);
      setProgress('');
      return null;
    }
  }, []);

  const recordVideo = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission Required', 'Allow camera access in Settings.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 60,
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      setVideoUri(asset.uri);
      setIsProcessing(true);
      setProgress('Extracting key frames from video...');

      const durationMs = asset.duration ? asset.duration * 1000 : 15000;
      const extractedFrames = await extractKeyFrames(asset.uri, durationMs, 5);

      setProgress('Preparing frames...');

      const framesWithBase64 = await Promise.all(
        extractedFrames.map(async (frame) => ({
          ...frame,
          base64: await frameToBase64(frame.uri),
        }))
      );

      setFrames(framesWithBase64);
      setProgress('');
      setIsProcessing(false);

      return {
        videoUri: asset.uri,
        frames: framesWithBase64,
        frameCount: framesWithBase64.length,
      };
    } catch (err) {
      console.error('recordVideo error:', err);
      Alert.alert('Camera Error', 'Could not record video. Please try again.');
      setIsProcessing(false);
      setProgress('');
      return null;
    }
  }, []);

  const clearVideo = useCallback(() => {
    setVideoUri(null);
    setFrames([]);
    setProgress('');
  }, []);

  return {
    videoUri,
    frames,
    isProcessing,
    progress,
    pickVideo,
    recordVideo,
    clearVideo,
  };
}
