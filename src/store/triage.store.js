import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useTriageStore = create(
  persist(
    (set, get) => ({
      // Current session state
      sessionId:       null,
      messages:        [],      // [{id, role, content, type, timestamp, imageUrl}]
      isAnalyzing:     false,   // AI is processing
      isRecording:     false,   // Voice recording active
      uploadedImage:   null,    // { uri, base64 }
      sessionProgress: 0,       // 0-100, estimated completion

      // Result state
      result:          null,    // Full triage result object from Edge Function

      // History
      pastSessions:    [],
      historyLoading:  true,

      // Actions
      setSessionId:       (id) => set({ sessionId: id }),
      addMessage:         (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      setAnalyzing:       (v) => set({ isAnalyzing: v }),
      setRecording:       (v) => set({ isRecording: v }),
      setUploadedImage:   (img) => set({ uploadedImage: img }),
      setSessionProgress: (p) => set({ sessionProgress: p }),
      setResult:          (result) => set({ result }),
      setHistoryLoading:  (historyLoading) => set({ historyLoading }),
      setPastSessions:    (sessions) => set({ pastSessions: sessions, historyLoading: false }),
      resetSession: () => set({
        sessionId: null, messages: [], isAnalyzing: false,
        isRecording: false, uploadedImage: null,
        sessionProgress: 0, result: null,
      }),
    }),
    {
      name: 'triage-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        sessionId: state.sessionId, 
        messages: state.messages, 
        uploadedImage: state.uploadedImage, 
        sessionProgress: state.sessionProgress 
      }),
    }
  )
)
