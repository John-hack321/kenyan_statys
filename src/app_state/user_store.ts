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
  // The id of this account's venture, or null if the account is not a host yet.
  // Read from the database by lib/host.ts (refreshHostStatus), never from user_metadata.
  // `isHost` is just `ventureId !== null`.
  ventureId: string | null;
  setUser: (user: User) => void;
  setVentureId: (id: string | null) => void;
  resetUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      ventureId: null,
      setUser: (user) => set({ user }),
      setVentureId: (ventureId) => set({ ventureId }),
      resetUser: () => set({ user: null, ventureId: null }),
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

export const useIsHost = () => useUserStore((s) => s.ventureId !== null);