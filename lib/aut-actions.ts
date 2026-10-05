import { supabase } from './supabase'
import { useUserStore } from '../src/app_state/user_store'

// Email + password sign in. (Phone sign in needs an SMS provider in Supabase, so it is not available yet.)
export async function login(identifier: string, password: string) {
    if (!identifier.includes('@')) {
        throw new Error("Phone sign in isn't available yet. Please use your email or continue with Google.")
    }
    const { error } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
    })
    if (error) throw error
    // Nothing else to do: AuthProvider hears SIGNED_IN and updates everything.
}

// Same argument order as the old signup(), so sign-up.tsx barely changes.
export async function signup(
    email: string,
    phone: string,
    first_legal_name: string,
    last_legal_name: string,
    // id_number: string, // we only get id number when a user is becmong a host for verification purposes hence this one wil be pickd up later 
    date_of_birth: Date,
    password: string,
) {
    const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
            // user_metadata can be edited by the user, so only put harmless things here.
            // phone / id_number / date_of_birth should go in a `profiles` table with RLS (not saved yet).
            data: {
                full_name: `${first_legal_name} ${last_legal_name}`.trim(),
                first_legal_name,
                last_legal_name,
            },
        },
    })
    if (error) throw error

    // Supabase does not error when the email already exists, it returns a user with no identities.
    if (data.user && data.user.identities?.length === 0) {
        throw new Error('An account with this email already exists. Please sign in instead.')
    }

    // If "Confirm email" is on in Supabase, there is no session until the user clicks the email link.
    return { needsEmailConfirmation: data.session === null }
}

export async function signOut() {
    await supabase.auth.signOut()
    useUserStore.getState().resetUser()
}