import { UserResponse } from '@/services/api/model';
import { create } from 'zustand';



interface UserStore {
  user: UserResponse | null;
  isLoading: boolean;
  
  setUser: (user: UserResponse | null) => void;
  clearUser: () => void;
  setLoading: (status: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true, 
  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),
  setLoading: (status) => set({ isLoading: status }),
}));