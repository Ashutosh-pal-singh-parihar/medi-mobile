import { useEffect } from 'react'
import { useAuthStore } from '../../../store/auth.store'
import { authService } from '../services/auth.service'

export function useAuth() {
  const {
    user,
    patientProfile,
    isAuthenticated,
    isLoading,
    setUser,
    setPatientProfile,
    setLoading,
    clearAuth,
  } = useAuthStore()

  useEffect(() => {
    let mounted = true

    // Check existing session on mount
    const initAuth = async () => {
      try {
        const session = await authService.getSession()
        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          const profile = await authService.getPatientProfile(session.user.id)
          if (mounted && profile) setPatientProfile(profile)
        }
      } catch (e) {
        console.log('initAuth error:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id)
        if (!mounted) return

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user)
            const profile = await authService.getPatientProfile(session.user.id)
            if (mounted && profile) setPatientProfile(profile)
          } else if (event === 'SIGNED_OUT') {
            clearAuth()
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            setUser(session.user)
          }
        } catch (e) {
          console.log('onAuthStateChange error:', e)
        } finally {
          if (mounted) setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    const data = await authService.signIn(email, password)
    return data
  }

  const signOut = async () => {
    try {
      await authService.signOut()
    } catch (e) {
      console.log('signOut error:', e)
    } finally {
      clearAuth()
    }
  }

  return {
    user,
    patientProfile,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    signUp: authService.signUp,
  }
}
