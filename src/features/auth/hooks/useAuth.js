import { useEffect } from 'react'
import { useAuthStore } from '../../../store/auth.store'
import { authService } from '../services/auth.service'
import { ambulanceService } from '../../ambulance/services/ambulance.service'

export function useAuth() {
  const {
    user,
    patientProfile,
    doctorProfile,
    ambulanceProfile,
    role,
    isDoctor,
    isAuthenticated,
    isLoading,
    setUser,
    setPatientProfile,
    setDoctorProfile,
    setAmbulanceProfile,
    setRole,
    setLoading,
    clearAuth,
  } = useAuthStore()

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const session = await authService.getSession()
        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          
          // Get role: Check metadata first, then DB
          const metaRole = session.user.user_metadata?.role
          const dbRole = await authService.getUserRole(session.user.id)
          const userRole = metaRole || dbRole
          
          if (mounted && userRole) setRole(userRole)
          
          // Fetch corresponding profile
          if (userRole === 'patient') {
            const pProfile = await authService.getPatientProfile(session.user.id)
            if (mounted && pProfile) setPatientProfile(pProfile)
          } else if (userRole === 'doctor') {
            const dProfile = await authService.getDoctorProfile(session.user.id)
            if (mounted && dProfile) setDoctorProfile(dProfile)
          } else if (userRole === 'ambulance') {
            // Give a tiny moment for DB trigger if it was a fresh signup
            const aProfile = await ambulanceService.getProfile(session.user.id)
            if (mounted && aProfile) setAmbulanceProfile(aProfile)
          }
        }
      } catch (e) {
        console.log('initAuth error:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        try {
          if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
            setLoading(true) // STOP THE FLICKER
            setUser(session.user)
            const metaRole = session.user.user_metadata?.role
            const dbRole = await authService.getUserRole(session.user.id)
            const userRole = metaRole || dbRole
            if (mounted && userRole) setRole(userRole)
            
            if (userRole === 'patient') {
              const pProfile = await authService.getPatientProfile(session.user.id)
              if (mounted && pProfile) setPatientProfile(pProfile)
            } else if (userRole === 'ambulance') {
              const aProfile = await ambulanceService.getProfile(session.user.id)
              if (mounted && aProfile) setAmbulanceProfile(aProfile)
            }
          } else if (event === 'SIGNED_OUT') {
            clearAuth()
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

  return {
    user,
    patientProfile,
    doctorProfile,
    ambulanceProfile,
    role,
    isDoctor,
    isAuthenticated,
    isLoading,
    signIn: authService.signIn,
    signOut: async () => { await authService.signOut(); clearAuth() },
    signUp: authService.signUp,
  }
}
