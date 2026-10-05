import { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useAuthContext } from './auth-context'
import { setPendingAction } from '../pending-actions'


// this is the gateway that we will call from buttons that will allow us to enforce the actions that cannot happen unless a user 
// is logged in .

export function useRequireAuth() {
    const { isLoggedIn } = useAuthContext()
    const router = useRouter()

    return useCallback(
        (action: () => void) => {
            if (isLoggedIn) {
                action()
                return
            }
            setPendingAction(action) // stores the action that the user was just about to do before hey were asked to sign up . 
            router.push('/sign-in') // this makes the sign in page to slide up as a dial ontop of the current page. 
        },
        [isLoggedIn, router]
    )
}

// example usage : 

// const requireAuth = useRequireAuth()
// 
// <TouchableOpacity onPress={() => requireAuth(() => likeListing(listing.id))}>
// <TouchableOpacity onPress={() => requireAuth(() => router.push(`/chat/${owner.id}`))}>