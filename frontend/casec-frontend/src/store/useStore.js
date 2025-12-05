import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      
      updateUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData } 
      })),
    }),
    {
      name: 'casec-auth',
    }
  )
);

export const useAppStore = create((set) => ({
  membershipTypes: [],
  clubs: [],
  events: [],
  myClubs: [],
  myEvents: [],
  dashboardData: null,
  
  setMembershipTypes: (types) => set({ membershipTypes: types }),
  setClubs: (clubs) => set({ clubs: clubs }),
  setEvents: (events) => set({ events: events }),
  setMyClubs: (clubs) => set({ myClubs: clubs }),
  setMyEvents: (events) => set({ myEvents: events }),
  setDashboardData: (data) => set({ dashboardData: data }),
}));
