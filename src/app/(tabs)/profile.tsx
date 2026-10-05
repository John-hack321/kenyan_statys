import { Text, TouchableOpacity, View } from "react-native";
import { useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CountryCodePicker } from '@/components/CountryCodePicker';
import { DEFAULT_COUNTRY } from '@/constants/countryCodes';
import { useUserStore } from '@/app_state/user_store';
import { signOut } from "@/lib/aut-actions";
import { useAuthContext } from '../../../lib/hooks/auth-context';

const Profile = () => {
    const [country, setCountry] = useState(DEFAULT_COUNTRY);
    const user = useUserStore((state) => state.user);
    const { isLoggedIn, isLoading } = useAuthContext();
    const router = useRouter();

    if (isLoading) return null;

    // Guest view: the tab is still reachable, it just asks them to sign in.
    if (!isLoggedIn) {
        return (
            <View className="p-5 items-center justify-center flex-1">
                <Text className="text-lg font-bold mb-2">You're browsing as a guest</Text>
                <Text className="text-sm text-gray-600 mb-6 text-center">Sign in to see your profile, save listings and message owners.</Text>
                <TouchableOpacity onPress={() => router.push('/sign-in')} className="bg-black rounded-lg px-6 py-3">
                    <Text className="text-white font-bold">Sign in</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="p-5">
            <Text className="text-lg font-bold mb-4">Profile Settings</Text>

            <View className="mb-6 flex-row items-center" style={{ gap: 12 }}>
                {user?.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={{ width: 56, height: 56, borderRadius: 28 }} />
                ) : null}
                <View>
                    <Text className="text-base font-bold">{user?.fullName ?? "No name yet"}</Text>
                    <Text className="text-sm text-gray-600">{user?.email}</Text>
                </View>
            </View>

            <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">Country Code</Text>
                <CountryCodePicker value={country} onChange={setCountry} />
            </View>

            <TouchableOpacity onPress={signOut} className="mt-6 bg-black rounded-lg p-3 items-center">
                <Text className="text-white font-bold">Sign out</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Profile;