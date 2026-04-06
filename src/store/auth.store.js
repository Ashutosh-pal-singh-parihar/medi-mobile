import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  session: null,
  user: null,
  patientProfile: null,
  doctorProfile: null,
  ambulanceProfile: null,
  role: null, // 'patient' | 'doctor' | 'ambulance'
  isLoading: true,
  
  // Computed-like state for easier use in guards
  isAuthenticated: false,
  isDoctor: false,

  setSession: (session) => set({ session, user: session?.user || null, isAuthenticated: !!session?.user }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setPatientProfile: (profile) => set({ patientProfile: profile, isDoctor: false, role: 'patient' }),
  setDoctorProfile: (profile) => set({ doctorProfile: profile, isDoctor: true, role: 'doctor' }),
  setAmbulanceProfile: (profile) => set({ ambulanceProfile: profile, isDoctor: false, role: 'ambulance' }),
  setRole: (role) => set({ role }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ 
    session: null, 
    user: null, 
    patientProfile: null, 
    doctorProfile: null,
    ambulanceProfile: null,
    role: null,
    isLoading: false, 
    isAuthenticated: false,
    isDoctor: false
  }),
}));

export default useAuthStore;
