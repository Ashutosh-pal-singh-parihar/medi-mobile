import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  session: null,
  user: null,
  patientProfile: null,
  isLoading: true,
  
  // Computed-like state for easier use in guards
  isAuthenticated: false,

  setSession: (session) => set({ session, user: session?.user || null, isAuthenticated: !!session?.user }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setPatientProfile: (profile) => set({ patientProfile: profile }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ 
    session: null, 
    user: null, 
    patientProfile: null, 
    isLoading: false, 
    isAuthenticated: false 
  }),
}));

export default useAuthStore;
