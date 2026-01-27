import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),

      // Check if user has access to admin panel (isAdmin OR has any admin roles)
      hasAdminAccess: () => {
        const { user } = get();
        if (!user) return false;
        return user.isAdmin || (user.allowedAdminAreas && user.allowedAdminAreas.length > 0);
      },

      // Check if user can access a specific admin area
      canAccessArea: (areaKey) => {
        const { user } = get();
        if (!user) return false;
        // System admins can access everything
        if (user.isAdmin) return true;
        // Check if area is in user's allowed areas
        return user.allowedAdminAreas?.includes(areaKey) || false;
      },
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
