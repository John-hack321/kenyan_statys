// store/userStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// The profile we keep on the device. It is filled from the Supabase session
// (for Google sign-in the name/avatar come from Google).
export type User = {
  id: string;          // Supabase user id (a UUID string)
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  provider?: string;   // 'google' | 'email'
};

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
  resetUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      resetUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage', // key used under the hood in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // The shape of `user` changed (id used to be a number from the old backend).
      // Bumping the version throws away any old saved user instead of crashing on it.
      version: 1,
      migrate: () => ({ user: null }) as any,
    }
  )
);


type UsageMode = {
  mode: "host" | "guest";
  setMode: (mode: "host" | "guest") => void;
};

export const modeStore = create<UsageMode>()(
  persist(
    (set) => ({
      mode: "guest",

      setMode: (mode) =>
        set({
          mode,
        }),
    }),
    {
      name: "mode-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);