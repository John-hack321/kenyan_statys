import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import aesjs from 'aes-js'
import { getRandomBytes } from 'expo-crypto'
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store'

/**
 * Storage for the Supabase session.
 *
 * A session (tokens + user profile) is bigger than SecureStore's 2048 byte limit, so:
 *   - the session itself is ENCRYPTED (AES-256) and saved in AsyncStorage (no size limit)
 *   - the small encryption key (32 bytes) is saved in SecureStore (hardware-backed, secure)
 * Someone reading AsyncStorage only sees scrambled text.
 */
class LargeSecureStore {
    private async _encrypt(key: string, value: string) {
        // aes-js cannot round-trip emoji (4-byte characters). The session is JSON, and JSON
        // understands \uXXXX escapes, so we write emoji that way (a name like "Sam 😀" would otherwise corrupt).
        value = value.replace(/[\ud800-\udfff]/g, (c) => '\\u' + c.charCodeAt(0).toString(16))

        // A brand new random key for every save, so a key/counter pair is never reused.
        const encryptionKey = getRandomBytes(256 / 8)
        const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1))
        const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value))

        await setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey))
        return aesjs.utils.hex.fromBytes(encryptedBytes)
    }

    private async _decrypt(key: string, value: string) {
        const encryptionKeyHex = await getItemAsync(key)
        if (!encryptionKeyHex) return null

        const cipher = new aesjs.ModeOfOperation.ctr(
            aesjs.utils.hex.toBytes(encryptionKeyHex),
            new aesjs.Counter(1)
        )
        const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value))
        return aesjs.utils.utf8.fromBytes(decryptedBytes)
    }

    async getItem(key: string) {
        const encrypted = await AsyncStorage.getItem(key)
        if (!encrypted) return null
        try {
            return await this._decrypt(key, encrypted)
        } catch {
            return null   // unreadable (e.g. key lost) -> behave as signed out instead of crashing
        }
    }

    async setItem(key: string, value: string) {
        const encrypted = await this._encrypt(key, value)
        await AsyncStorage.setItem(key, encrypted)
    }

    async removeItem(key: string) {
        await AsyncStorage.removeItem(key)
        await deleteItemAsync(key)
    }
}

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
    {
        auth: {
            storage: new LargeSecureStore(),
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
)