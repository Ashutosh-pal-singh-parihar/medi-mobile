import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ActivityIndicator,
  Keyboard,
  StatusBar,
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
import { useImagePicker } from '../../../features/triage/hooks/useImagePicker';
import { useVideoPicker } from '../../../features/triage/hooks/useVideoPicker';
import { useTriageStore } from '../../../store/triage.store';
import { useLanguage } from '../../../hooks/useLanguage';
import { describeVideoFrames } from '../../../features/triage/services/ai.service';

export default function TriageSessionScreen() {
  const { initialMethod = 'text', initialInput, imageBase64: initialImage } = useLocalSearchParams();
  const router = useRouter();
  const { t, language, toggleLanguage } = useLanguage();
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  const [inputMode, setInputMode] = useState(initialMethod === 'media' ? 'media' : (initialMethod === 'voice' ? 'voice' : 'text'));
  const [inputText, setInputText] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const { messages, isAnalyzing, addMessage, replaceLastMessage } = useTriageStore();
  const { 
    startSession, 
    sendMessage, 
    handleUserFinish, 
    questionCount, 
    canFinish, 
    isComplete 
  } = useTriageSession();

  const { openCamera, openGallery, isLoading: isImageLoading } = useImagePicker();
  const { pickVideo, recordVideo, isProcessing: isVideoProcessing, progress: videoProgress } = useVideoPicker();

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isAnalyzing, isVideoProcessing]);

  // Handle keyboard show scroll & visibility
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ── Start session once on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!sessionStarted) {
      setSessionStarted(true);
      startSession({
        initialInput: initialInput || (initialMethod === 'image' ? 'Analyze this symptom image.' : 'I need help with my symptoms.'),
        inputType: initialMethod || 'text',
        imageBase64: initialImage || null,
        language,
      });
    }
  }, []);

  // ── Send text message ─────────────────────────────────────────────────────
  const handleSendText = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isAnalyzing) return;
    setInputText('');
    inputRef.current?.blur();
    await sendMessage(trimmed, 'text', language);
  };

  // ── Handle Media ──────────────────────────────────────────────────────────
  const handleImageComplete = async (result) => {
    if (result && result.base64) {
      await sendMessage('Analyze this symptom image.', 'image', language, result.base64);
    }
  };

  const handleVideoComplete = async (videoResult) => {
    if (videoResult) {
      // Show processing UI as a user message
      addMessage({ 
        id: 'video_proc_' + Date.now(),
        role: 'user', 
        content: '🎥 Video uploaded. Analyzing...', 
        type: 'text' 
      });

      try {
        // Describe frames using AI (token-efficient)
        const description = await describeVideoFrames(videoResult.frames);
        
        // Use the description for the session
        await sendMessage(description, 'text', language);
      } catch (err) {
        console.error('Video description error:', err);
        addMessage({
          id: 'video_err_' + Date.now(),
          role: 'assistant',
          content: 'I had trouble analyzing the video. Could you try uploading a photo instead?',
          type: 'text'
        });
      }
    }
  };

  const handleVoiceComplete = async (result) => {
    if (result && result.base64) {
      await sendMessage('[Voice message]', 'voice', language, result.base64);
    }
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

  // ── Render Helpers ────────────────────────────────────────────────────────
  const renderInputBar = () => (
    <View style={inputStyles.inputBar}>
      <TextInput
        ref={inputRef}
        style={inputStyles.textInput}
        value={inputText}
        onChangeText={setInputText}
        placeholder={language === 'hi' ? 'अपने लक्षणों के बारे में लिखें...' : "Type your symptoms..."}
        placeholderTextColor="#9CA3AF"
        multiline
        maxLength={500}
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={handleSendText}
        editable={!isAnalyzing}
      />
      <TouchableOpacity
        style={[inputStyles.sendBtn, !inputText.trim() && inputStyles.sendBtnDisabled]}
        onPress={handleSendText}
        disabled={!inputText.trim() || isAnalyzing}
        activeOpacity={0.7}
      >
        <Ionicons name="send" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderMediaPicker = () => (
    <View style={mediaStyles.container}>
      <Text style={mediaStyles.title}>Upload Photo or Video</Text>
      <View style={mediaStyles.row}>
        <TouchableOpacity style={mediaStyles.item} onPress={async () => handleImageComplete(await openCamera())}>
          <View style={[mediaStyles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="camera" size={32} color="#3B82F6" />
          </View>
          <Text style={mediaStyles.label}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={mediaStyles.item} onPress={async () => handleImageComplete(await openGallery())}>
          <View style={[mediaStyles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="images" size={32} color="#16A34A" />
          </View>
          <Text style={mediaStyles.label}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={mediaStyles.item} onPress={async () => handleVideoComplete(await recordVideo())}>
          <View style={[mediaStyles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="videocam" size={32} color="#EF4444" />
          </View>
          <Text style={mediaStyles.label}>Video</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={mediaStyles.item} onPress={async () => handleVideoComplete(await pickVideo())}>
          <View style={[mediaStyles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
            <Ionicons name="film" size={32} color="#D97706" />
          </View>
          <Text style={mediaStyles.label}>Pick Video</Text>
        </TouchableOpacity>
      </View>
      {(isImageLoading || isVideoProcessing) && (
        <View style={mediaStyles.loader}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={mediaStyles.loaderText}>{videoProgress || 'Processing...'}</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScreenWrapper bg="#F9FAFB">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.titleText}>Triage Session</Text>
            <Text style={styles.subtitleText}>{questionCount} questions asked</Text>
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
          renderItem={({ item, index }) => (
            <View>
              <ChatBubble message={item} />
              {index === messages.length - 1 &&
                item.role === 'assistant' &&
                !isAnalyzing && (
                  <QuickReplyChips
                    chips={item.quickReplies}
                    onSelect={(reply) => sendMessage(reply, 'text', language)}
                  />
                )}
            </View>
          )}
          ListFooterComponent={
            <>
              {isAnalyzing && <TypingIndicator />}
              {canFinish && !isComplete && (
                <View style={finishStyles.container}>
                  <Text style={finishStyles.hint}>
                    {questionCount} questions answered · AI may ask more if needed
                  </Text>
                  <TouchableOpacity
                    style={finishStyles.button}
                    onPress={() => handleUserFinish(language)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={finishStyles.buttonText}>Finish Triage & Get Result</Text>
                  </TouchableOpacity>
                  <Text style={finishStyles.subHint}>
                    Or keep answering for a more accurate result
                  </Text>
                </View>
              )}
              <View style={{ height: 20 }} />
            </>
          }
        />

        {!isKeyboardVisible && (
          <View style={modeStyles.bar}>
            {[
              { id: 'text', icon: 'create-outline', label: 'Type' },
              { id: 'voice', icon: 'mic-outline', label: 'Voice' },
              { id: 'media', icon: 'attach-outline', label: 'Photo/Video' }
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[modeStyles.tab, inputMode === m.id && modeStyles.tabActive]}
                onPress={() => setInputMode(m.id)}
              >
                <Ionicons
                  name={m.icon}
                  size={18}
                  color={inputMode === m.id ? '#3B82F6' : '#6B7280'}
                />
                <Text style={[modeStyles.label, inputMode === m.id && modeStyles.labelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputContainer}>
          {inputMode === 'text' && renderInputBar()}
          {inputMode === 'voice' && (
            <View style={styles.voiceWrapper}>
              <VoiceRecorder onRecordingComplete={handleVoiceComplete} disabled={isAnalyzing} />
            </View>
          )}
          {inputMode === 'media' && renderMediaPicker()}
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: { alignItems: 'center' },
  titleText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subtitleText: { fontSize: 12, color: '#6B7280' },
  langToggle: {
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: '#F3F4F6', borderRadius: 6,
  },
  langText: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },
  chatContent: { padding: 16, paddingBottom: 20 },
  inputContainer: { backgroundColor: '#fff' },
  voiceWrapper: { paddingVertical: 10, alignItems: 'center' },
});

const inputStyles = StyleSheet.create({
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    gap: 8,
  },
  textInput: {
    flex: 1, minHeight: 44, maxHeight: 120,
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 22, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 15, color: '#111827',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },
});

const modeStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row', backgroundColor: '#F3F4F6',
    marginHorizontal: 12, marginBottom: 4, borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 8, gap: 4, borderRadius: 8,
  },
  tabActive: { backgroundColor: '#fff', elevation: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2 },
  label: { fontSize: 12, color: '#6B7280' },
  labelActive: { color: '#3B82F6', fontWeight: '600' },
});

const finishStyles = StyleSheet.create({
  container: {
    margin: 16, padding: 16, backgroundColor: '#EFF6FF',
    borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE',
    alignItems: 'center',
  },
  hint: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  button: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#3B82F6', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 24,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  subHint: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
});

const mediaStyles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  title: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  item: { alignItems: 'center', gap: 6 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  loader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 8 },
  loaderText: { fontSize: 12, color: '#3B82F6', fontWeight: '500' },
});
