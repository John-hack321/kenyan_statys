import { PropsWithChildren, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from '../lib/hooks/auth-context'
import { supabase } from '../lib/supabase'
import { User, useUserStore } from '../src/app_state/user_store'

// claude notes.
// Turns a Supabase session into the small profile object we keep in zustand.
// For Google sign-in, Supabase puts Google's profile in user.user_metadata.

// my notes = > 
// gets the user data from the supabase session so that we can use it on thea app 
// it gets the username , email and other important stuff . 
function userFromSession(session: Session): User {
    const meta = session.user.user_metadata ?? {}
    const fullName =
        meta.full_name ||
        meta.name ||
        [meta.first_legal_name, meta.last_legal_name].filter(Boolean).join(' ') ||
        undefined

    return {
        id: session.user.id,
        email: session.user.email ?? undefined,
        fullName,
        avatarUrl: meta.avatar_url || meta.picture || undefined,
        provider: session.user.app_metadata?.provider,
    }
}

export default function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const setUser = useUserStore((s) => s.setUser)
    const resetUser = useUserStore((s) => s.resetUser)

    useEffect(() => {
        // Supabase calls this once at startup (INITIAL_SESSION) and again on every
        // SIGNED_IN, SIGNED_OUT and TOKEN_REFRESHED. So this one listener is enough.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            console.log('Auth state changed:', event)
            setSession(newSession)

            if (newSession) {
                setUser(userFromSession(newSession)) // the setUser function is a self defined function from zustand for setting the user data 
            } else {
                resetUser()
            }
            setIsLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [setUser, resetUser])

    return (
        <AuthContext.Provider value={{ session, isLoading, isLoggedIn: session !== null }}>
            {children}
        </AuthContext.Provider>
    )
}