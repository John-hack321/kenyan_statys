// store/userStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '../../lib/authContext';

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