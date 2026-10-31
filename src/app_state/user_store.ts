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
  // Read from the database by src/lib/host.ts (refreshHostStatus), never from user_metadata.
  // `isHost` is just `ventureId !== null`.
  ventureId: string | null;
  // ventures.is_verified for that venture. null = not a host, or not loaded yet.
  // false = a host who still has to finish verification (the "Finish setting up" card is shown).
  ventureVerified: boolean | null;
  // DEV ONLY (never saved, ignored in release builds): makes the UI act like a host so the host side can be built
  // before publishing works. It changes what the UI SHOWS, nothing else: data and publishing still use ventureId.
  devForceHost: boolean; // we will use this for testing the host side without beind a host . 
  setUser: (user: User) => void;
  setVentureId: (id: string | null) => void;
  setVentureStatus: (id: string | null, verified: boolean | null) => void;
  setDevForceHost: (on: boolean) => void;
  resetUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      ventureId: null,
      ventureVerified: null,
      devForceHost: false,
      setUser: (user) => set({ user }),
      setVentureId: (ventureId) => set(ventureId === null ? { ventureId, ventureVerified: null } : { ventureId }),
      setVentureStatus: (ventureId, ventureVerified) => set({ ventureId, ventureVerified }),
      setDevForceHost: (devForceHost) => set({ devForceHost }),
      resetUser: () => {
        set({ user: null, ventureId: null, ventureVerified: null, devForceHost: false });
        // the next person on this phone must not land on the host tabs
        modeStore.getState().setMode("guest");
      },
    }),
    {
      name: 'user-storage', // key used under the hood in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // The shape of `user` changed (id used to be a number from the old backend).
      // Bumping the version throws away any old saved user instead of crashing on it.
      version: 1,
      migrate: () => ({ user: null }) as any,
      // devForceHost is never saved: it always starts off
      partialize: (state) => ({ user: state.user, ventureId: state.ventureId, ventureVerified: state.ventureVerified }),
    }
  )
);


type UsageMode = {
  mode: "host" | "guest";
  setMode: (mode: "host" | "guest") => void;
};

// Which side of the app the person is LOOKING at. It is only a view preference: a non-host is always shown the guest side
// (see useAppMode), and the database decides what anyone may actually do.
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

// Is this ACCOUNT a host? (the dev toggle only counts in development builds)
export const useIsHost = () => useUserStore((s) => s.ventureId !== null || (__DEV__ && s.devForceHost));