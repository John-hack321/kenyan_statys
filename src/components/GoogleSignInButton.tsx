import { TouchableOpacity, View, Text, ActivityIndicator } from "react-native"
import GoogleIcon from "@/components/google-icon";
import { GoogleSignInButtonProps } from "@/constants/type";
import { rv } from "@/styles/responsive";
import * as sentry from "@sentry/react-native"

import { supabase } from '@/lib/supabase'
import { expo } from '@/app.json'
import { Image } from 'expo-image'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { useEffect, useState } from "react";


const GoogleSignInButton = ({styles, text} : GoogleSignInButtonProps) => {
"sb_publishable_zYIeWhmBgOqa8VQucMSslQ_G7hKHTQ9"
    const [isLoading , setIsloading] = useState(false)

    function extractParamsFromUrl(url: string) {
        const parsedUrl = new URL(url)
        const hash = parsedUrl.hash.substring(1) // Remove the leading '#'
        const params = new URLSearchParams(hash)
        return {
            access_token: params.get('access_token'),
            expires_in: parseInt(params.get('expires_in') || '0'),
            refresh_token: params.get('refresh_token'),
            token_type: params.get('token_type'),
            provider_token: params.get('provider_token'),
            code: params.get('code'),
        }
        }
        async function onSignInButtonPress() {
        console.debug('onSignInButtonPress - start')
        console.log("now setting isLoading to laoding")
        setIsloading(true)
        const redirectTo = Linking.createURL('/')
        console.log('Redirect URL being sent to Supabase:', redirectTo)
        const res = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
            redirectTo: redirectTo,
            queryParams: { prompt: 'consent' },
            skipBrowserRedirect: true,
            },
        })
        const googleOAuthUrl = res.data.url
        if (!googleOAuthUrl) {
            console.error('no oauth url found!')
            return
        }
        const result = await WebBrowser.openAuthSessionAsync(
            googleOAuthUrl,
            redirectTo,
            { showInRecents: true }
        ).catch((err) => {
            console.error('onSignInButtonPress - openAuthSessionAsync - error', { err })
            console.log(err)
        })
        console.debug('onSignInButtonPress - openAuthSessionAsync - result', { result })
        if (result && result.type === 'success') {
            console.debug('onSignInButtonPress - openAuthSessionAsync - success')
            const params = extractParamsFromUrl(result.url)
            console.debug('onSignInButtonPress - openAuthSessionAsync - success', { params })
            if (params.access_token && params.refresh_token) {
            console.debug('onSignInButtonPress - setSession')
            const { data, error } = await supabase.auth.setSession({
                access_token: params.access_token,
                refresh_token: params.refresh_token,
            })
            console.debug('onSignInButtonPress - setSession - success', { data, error })
            return
            } else {
            console.error('onSignInButtonPress - setSession - failed')
            // sign in/up failed
            }
        } else {
            console.error('onSignInButtonPress - openAuthSessionAsync - failed')
        }
        setIsloading(false) // I am not sure if I have placed this in the right place . 
        }
        // to warm up the browser
        useEffect(() => {
            WebBrowser.warmUpAsync()
            return () => {
            WebBrowser.coolDownAsync()
        }
        }, [])

    return (
        <TouchableOpacity 
        onPress={onSignInButtonPress}
        className={` ${styles}`} >
            {
                isLoading ? (
                    <ActivityIndicator size="small" color="black"/>
                ) : (
                    <View className="flex flex-row itmes-center justify-center " style={{gap: rv(8)}}>
                        <GoogleIcon size={rv(18)} />
                        <Text className="text-[#1F1F1F] font-bold">{text}</Text>
                    </View>
                )
            }
            
        </TouchableOpacity>

    )
}

export default GoogleSignInButton;