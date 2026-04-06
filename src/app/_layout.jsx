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

  const { isAuthenticated, isLoading, patientProfile, ambulanceProfile, role } = useAuthStore()
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
    const inAmbulanceGroup = segments[0] === '(ambulance)'

    console.log('Nav check:', { isAuthenticated, role, inAuthGroup, segments: segments[0] })

    if (isAuthenticated) {
      if (role === 'ambulance') {
        if (!ambulanceProfile && segments[1] !== 'ambulance-setup') {
          router.replace('/(auth)/ambulance-setup')
        } else if (ambulanceProfile && (inAuthGroup || inPatientGroup)) {
          router.replace('/(ambulance)/dashboard')
        }
      } else if (role === 'patient') {
        if (!patientProfile && segments[1] !== 'patient-setup') {
          router.replace('/(auth)/patient-setup')
        } else if (patientProfile && (inAuthGroup || inAmbulanceGroup)) {
          router.replace('/(patient)/home')
        }
      } else if (!role && inAuthGroup) {
        // No role yet, but signed in. Should be at role-select or profile-setup
        if (segments[1] !== 'role-select' && segments[1] !== 'patient-setup' && segments[1] !== 'ambulance-setup') {
           router.replace('/(auth)/role-select')
        }
      }
    } else {
      // Not authenticated
      if (!inAuthGroup) {
        router.replace('/(auth)/splash')
      }
    }

  }, [isAuthenticated, patientProfile, ambulanceProfile, role, isLoading, fontsLoaded, segments])

  if (!fontsLoaded || isLoading) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  )
}
