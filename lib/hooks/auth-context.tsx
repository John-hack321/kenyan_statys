import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthData = {
    session: Session | null   // the raw Supabase session (null = signed out)
    isLoading: boolean        // true until Supabase has told us if someone is signed in
    isLoggedIn: boolean       // true only when there is a valid session
}

export const AuthContext = createContext<AuthData>({
    session: null,
    isLoading: true,
    isLoggedIn: false,
})

export const useAuthContext = () => useContext(AuthContext)