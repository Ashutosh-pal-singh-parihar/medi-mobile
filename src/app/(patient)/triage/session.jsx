import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { theme } from '../../../styles/theme';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import ChatBubble from '../../../features/triage/components/ChatBubble';
import QuickReplyChips from '../../../features/triage/components/QuickReplyChips';
import VoiceRecorder from '../../../features/triage/components/VoiceRecorder';
import WaveformVisualizer from '../../../features/triage/components/WaveformVisualizer';
import TypingIndicator from '../../../features/triage/components/TypingIndicator';
import ImagePreview from '../../../features/triage/components/ImagePreview';
import { useTriageSession } from '../../../features/triage/hooks/useTriageSession';
import useVoiceRecorder from '../../../features/triage/hooks/useVoiceRecorder';
import { useImagePicker } from '../../../features/triage/hooks/useImagePicker';
import { useTriageStore } from '../../../store/triage.store';
import { useLanguage } from '../../../hooks/useLanguage';

export default function TriageSessionScreen() {
  const { initialMethod = 'text', initialInput, imageBase64: initialImage } = useLocalSearchParams();
  const router = useRouter();
  const { t, language, toggleLanguage } = useLanguage();
  const flatListRef = useRef(null);

  const [method, setMethod] = useState(initialMethod);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  const { messages, isAnalyzing } = useTriageStore();
  const { startSession, sendMessage, forceFinish } = useTriageSession();

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const { pickImage } = useImagePicker();

  // ── Progress calculation ──────────────────────────────────────────────────
  const userMsgCount = messages.filter((m) => m.role === 'user').length;
  const progressPercent = Math.min((userMsgCount / 5) * 100, 95);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(progressPercent, { duration: 500 });
  }, [progressPercent]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // ── Progress label (shows correct count) ─────────────────────────────────
  const getProgressLabel = () => {
    const aiCount = messages.filter((m) => m.role === 'assistant').length;
    if (aiCount === 0) return 'Starting...';
    if (progressPercent >= 95) return 'Almost done...';
    return `Question ${aiCount} of ~5`;
  };

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isAnalyzing]);

  // ── Start session once on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!sessionStarted) {
      setSessionStarted(true);
      startSession({
        initialInput: initialInput || 'I need help with my symptoms.',
        inputType: initialMethod || 'text',
        imageBase64: initialImage || null,
        language,
      });
    }
  }, []);

  // ── Send text message ─────────────────────────────────────────────────────
  const handleSendText = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text, 'text', language);
  };

  // ── Send voice message ────────────────────────────────────────────────────
  const handleSendVoice = async () => {
    try {
      const data = await stopRecording();
      if (data?.base64) {
        // Send base64 audio data as 4th parameter
        await sendMessage('[Voice message]', 'voice', language, data.base64);
        setMethod('text');
      } else {
        console.warn('[Voice] No recording data returned');
        setMethod('text');
      }
    } catch (e) {
      console.error('[Voice] handleSendVoice error:', e);
      setMethod('text');
    }
  };

  // ── Send image ────────────────────────────────────────────────────────────
  const handleSendImage = async () => {
    if (!selectedImage) return;
    const base64 = selectedImage.base64;
    const caption = inputText.trim() || 'Please analyze this image of my symptoms.';
    setSelectedImage(null);
    setInputText('');
    await sendMessage(caption, 'image', language, base64);
  };

  // ── Force finish ──────────────────────────────────────────────────────────
  const handleForceFinish = () => {
    forceFinish(language);
  };

  // ── Close with confirmation ───────────────────────────────────────────────
  const handleClose = () => {
    Alert.alert(
      'Exit Triage',
      'Progress will be lost. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.replace('/(patient)/home') },
      ]
    );
  };

  // ── Input area ────────────────────────────────────────────────────────────
  const renderInputArea = () => {
    if (method === 'voice') {
      return (
        <View style={styles.voiceArea}>
          <WaveformVisualizer isRecording={isRecording} />
          <VoiceRecorder
            isRecording={isRecording}
            onStart={startRecording}
            onStop={handleSendVoice}
          />
          <TouchableOpacity onPress={() => setMethod('text')} style={styles.switchBtn}>
            <Text style={styles.switchText}>Switch to text</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.inputOuter}>
        {/* Image preview */}
        {selectedImage && (
          <ImagePreview uri={selectedImage.uri} onRemove={() => setSelectedImage(null)} />
        )}

        {/* Finish & Get Results button */}
        {!isAnalyzing && userMsgCount >= 3 && (
          <TouchableOpacity style={styles.finishBtn} onPress={handleForceFinish}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.finishBtnText}>
              {language === 'hi' ? 'परिणाम देखें →' : 'Finish & Get Results →'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={async () => {
              const img = await pickImage();
              if (img) setSelectedImage(img);
            }}
          >
            <Ionicons name="camera" size={24} color={theme.colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={language === 'hi' ? 'उत्तर लिखें...' : 'Type a reply...'}
            placeholderTextColor={theme.colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isAnalyzing}
            returnKeyType="send"
            blurOnSubmit={false}
          />

          {!inputText.trim() && !selectedImage && (
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: theme.colors.accent || '#0891B2' }]}
              onPress={() => setMethod('voice')}
            >
              <Ionicons name="mic" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {(inputText.trim() || selectedImage) && (
            <TouchableOpacity
              style={[styles.sendBtn, isAnalyzing && styles.sendBtnDisabled]}
              onPress={selectedImage ? handleSendImage : handleSendText}
              disabled={isAnalyzing}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper bg="#F8FAFC">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
          <View style={styles.progressTextBg}>
            <Text style={styles.progressText}>{getProgressLabel()}</Text>
          </View>
        </View>

        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <View style={styles.headerDotRow}>
              <View style={styles.activeDot} />
              <Text style={styles.titleText}>MediTriage AI</Text>
            </View>
          </View>

          <TouchableOpacity onPress={toggleLanguage} style={styles.langToggle}>
            <Text style={styles.langText}>{language === 'en' ? 'EN' : 'हिं'}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View>
              <ChatBubble message={item} />
              {index === messages.length - 1 &&
                item.role === 'assistant' &&
                !isAnalyzing && (
                  <QuickReplyChips
                    chips={item.quickReplies}
                    visible={!isAnalyzing}
                    onSelect={(reply) => sendMessage(reply, 'text', language)}
                  />
                )}
            </View>
          )}
          ListFooterComponent={
            isAnalyzing
              ? <TypingIndicator />
              : <View style={{ height: 20 }} />
          }
        />

        {renderInputArea()}
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    height: 4,
    width: '100%',
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'visible',
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressTextBg: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  langToggle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 40,
  },
  inputOuter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginHorizontal: 16,
    marginTop: 12,
    height: 50,
    borderRadius: 12,
    ...theme.shadows.md,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  voiceArea: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  switchBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
});
