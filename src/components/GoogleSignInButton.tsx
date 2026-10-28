import GoogleIcon from "@/components/google-icon"
import AuthOptionRow from "./AuthOptionRow"
import { GoogleSignInButtonProps } from "@/constants/type"

import { supabase } from '@/lib/supabase'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { useEffect, useState } from "react"

WebBrowser.maybeCompleteAuthSession()

function extractParamsFromUrl(url: string) {
    const [beforeHash, hash = ''] = url.split('#')
    const query = beforeHash.split('?')[1] ?? ''
    const params = new URLSearchParams([query, hash].filter(Boolean).join('&'))
    return {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        code: params.get('code'),
        error: params.get('error_description') ?? params.get('error'),
    }
}

// `loginHint` (optional): Google pre-selects that account, e.g. the email the host typed earlier.
// It is only a hint: the person can still pick another account.
const GoogleSignInButton = ({ text, loginHint, sublabel, badge }: GoogleSignInButtonProps) => {
    const [isLoading, setIsloading] = useState(false)

    async function onSignInButtonPress() {
        console.debug('onSignInButtonPress - start')
        setIsloading(true)
        try {
            const redirectTo = Linking.createURL('/')
            console.log('Redirect URL being sent to Supabase:', redirectTo)

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                    queryParams: loginHint
                        // a hint only pre-selects; select_account makes sure the person can still pick another account
                        ? { prompt: 'select_account', login_hint: loginHint }
                        : { prompt: 'consent' },
                    skipBrowserRedirect: true,
                },
            })
            if (error || !data?.url) {
                console.error('no oauth url found!', error)
                return
            }

            // NOTE: no showInRecents here, that was causing the blue error screen
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
            console.log('auth session result:', result)

            if (result.type !== 'success') return

            const params = extractParamsFromUrl(result.url)
            if (params.error) {
                console.error('OAuth error:', params.error)
                return
            }

            if (params.access_token && params.refresh_token) {
                const { error } = await supabase.auth.setSession({
                    access_token: params.access_token,
                    refresh_token: params.refresh_token,
                })
                if (error) console.error('setSession failed', error)
            } else if (params.code) {
                const { error } = await supabase.auth.exchangeCodeForSession(params.code)
                if (error) console.error('exchangeCodeForSession failed', error)
            } else {
                console.error('No tokens or code in redirect URL:', result.url)
            }
        } catch (err) {
            console.error('Google sign-in failed', err)
        } finally {
            setIsloading(false)
        }
    }

    // to warm up the browser
    useEffect(() => {
        WebBrowser.warmUpAsync()
        return () => {
            WebBrowser.coolDownAsync()
        }
    }, [])

    return (
        <AuthOptionRow
            label={text}
            sublabel={sublabel}
            badge={badge}
            icon={<GoogleIcon size={20} />}
            loading={isLoading}
            onPress={onSignInButtonPress}
        />
    )
}

export default GoogleSignInButton