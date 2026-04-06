import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { useAuthStore } from '../store/auth.store'
import { useAuth } from '../features/auth/hooks/useAuth'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  // MUST call useAuth() here to initialize the listener
  useAuth()

  const { isAuthenticated, isLoading, patientProfile } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()

  const [fontsLoaded] = useFonts({
    'DMSans-Regular': require('../../assets/fonts/DMSans/DMSans-Regular.ttf'),
    'DMSans-Medium': require('../../assets/fonts/DMSans/DMSans-Medium.ttf'),
    'DMSans-SemiBold': require('../../assets/fonts/DMSans/DMSans-SemiBold.ttf'),
    'DMSans-Bold': require('../../assets/fonts/DMSans/DMSans-Bold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, isLoading])

  useEffect(() => {
    if (isLoading || !fontsLoaded) return

    const inAuthGroup = segments[0] === '(auth)'
    const inPatientGroup = segments[0] === '(patient)'

    console.log('Nav check:', { isAuthenticated, hasProfile: !!patientProfile, segments: segments[0] })

    if (!isAuthenticated && inPatientGroup) {
      router.replace('/(auth)/splash')
      return
    }

    if (isAuthenticated && !patientProfile && inPatientGroup) {
      router.replace('/(auth)/patient-setup')
      return
    }

    if (isAuthenticated && patientProfile && inAuthGroup) {
      router.replace('/(patient)/home')
      return
    }

    if (isAuthenticated && !patientProfile && inAuthGroup) {
      // Only redirect to patient-setup if not already going there
      const currentScreen = segments[1]
      if (currentScreen !== 'patient-setup' && currentScreen !== 'role-select') {
        router.replace('/(auth)/patient-setup')
      }
      return
    }

  }, [isAuthenticated, patientProfile, isLoading, fontsLoaded, segments])

  if (!fontsLoaded || isLoading) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  )
}
