import { useEffect, useState } from 'react'
import { supabase } from '../../../config/supabase'
import { AMBULANCE_TABLES } from '../../../config/constants'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'

const playAlertSound = async () => {
  try {
    // const { sound } = await Audio.Sound.createAsync(
    //   require('../../../assets/sounds/alert.mp3')
    // );
    
    // Using URI for now as local file is missing
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://www.soundjay.com/buttons/beep-01a.mp3' }
    );
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) sound.unloadAsync()
    })
  } catch (error) {
    console.warn('Alert sound file missing at assets/sounds/alert.mp3. Using fallback beep.');
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/buttons/beep-01a.mp3' }
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync()
      })
    } catch (e) {
      console.log('No alert sound available.');
    }
  }
}

const triggerHeavyHaptics = async () => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error), 400)
  setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error), 800)
}

export function useAmbulanceAlerts(ambulanceId) {
  const [alerts, setAlerts] = useState([])
  const [newAlertTrigger, setNewAlertTrigger] = useState(false)

  useEffect(() => {
    let mounted = true
    if (!ambulanceId) return

    // Subscribe with a unique channel name to prevent conflicts on re-renders
    const channelId = `ambulance_alerts_${ambulanceId}_${Date.now()}`
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: AMBULANCE_TABLES.AMBULANCE_CASES,
          filter: `ambulance_id=eq.${ambulanceId}`
        },
        async (payload) => {
          if (!mounted) return
          console.log('New ambulance alert!', payload.new)
          
          // Get full triage case data
          const { data: fullCase, error } = await supabase
            .from(AMBULANCE_TABLES.AMBULANCE_CASES)
            .select('*, triage_cases(detected_symptoms, ai_summary, risk_level, patient_profiles(age, gender))')
            .eq('id', payload.new.id)
            .single()
            
          if (mounted && fullCase && fullCase.status === 'pending') {
            setAlerts(prev => {
              // Avoid duplicates
              if (prev.find(a => a.id === fullCase.id)) return prev
              return [fullCase, ...prev]
            })
            setNewAlertTrigger(true)
            setTimeout(() => { if (mounted) setNewAlertTrigger(false) }, 3000)
            
            // Sound and Haptics
            playAlertSound()
            triggerHeavyHaptics()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: AMBULANCE_TABLES.AMBULANCE_CASES,
          filter: `ambulance_id=eq.${ambulanceId}`
        },
        (payload) => {
          if (!mounted) return
          // If a case is accepted/dismissed elsewhere or its status changes
          setAlerts(prev => prev.map(a => 
            a.id === payload.new.id ? { ...a, status: payload.new.status } : a
          ).filter(a => a.status === 'pending'))
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [ambulanceId])

  return { alerts, setAlerts, newAlertTrigger }
}
