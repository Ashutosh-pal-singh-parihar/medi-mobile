import { Audio } from 'expo-av';

/**
 * Normalizes an array of numbers to 0-1 range
 */
export const normalizeAmplitudes = (rawAmplitudes) => {
  if (!rawAmplitudes || rawAmplitudes.length === 0) return [];
  const max = Math.max(...rawAmplitudes);
  if (max === 0) return rawAmplitudes.fill(0);
  return rawAmplitudes.map(v => v / max);
};

/**
 * Generates a random amplitude array for placeholder waveform visualization
 */
export const generateFakeAmplitudes = (count = 20) => {
  return Array.from({ length: count }, () => Math.random());
};

/**
 * Formats duration in seconds to "M:SS"
 */
export const formatAudioDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Returns full expo-av recording options object for high-quality metering
 */
export const getAudioRecordingOptions = () => {
  return {
    android: {
      extension: '.m4a',
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      audioEncoder: Audio.AndroidAudioEncoder.AAC,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      audioQuality: Audio.IOSAudioQuality.HIGH,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  };
};
