import { Text, TouchableOpacity, View } from "react-native";
import { useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CountryCodePicker } from '@/components/CountryCodePicker';
import { DEFAULT_COUNTRY } from '@/constants/countryCodes';
import { useUserStore } from '@/app_state/user_store';
import { signOut } from "@/lib/aut-actions";
import { useAuthContext } from '../../../lib/hooks/auth-context';
import BecomeAHostButton from "@/components/becomeAHostButton";

import { Ionicons } from '@expo/vector-icons';

const Profile = () => {
    const [country, setCountry] = useState(DEFAULT_COUNTRY);
    const user = useUserStore((state) => state.user);
    const { isLoggedIn, isLoading } = useAuthContext();
    const router = useRouter();

    if (isLoading) return null;

   // Guest view: the tab is still reachable, it just asks them to sign in.
if (!isLoggedIn) {
    return (
        <View className="flex-1 bg-white px-6 items-center justify-center">
            {/* Icon */}
            <View className="h-20 w-20 rounded-full bg-gray-100 items-center justify-center mb-6">
                <Ionicons name="person-outline" size={36} color="#111" />
            </View>

            {/* Text */}
            <Text className="text-2xl font-bold text-center mb-2">
                You're browsing as a guest
            </Text>
            <Text className="text-base text-gray-500 text-center mb-8 max-w-[300px]">
                Sign in to see your profile, save listings and message owners.
            </Text>

            {/* Primary action */}
            <TouchableOpacity
                onPress={() => router.push('/sign-in')}
                activeOpacity={0.8}
                className="bg-black rounded-xl py-4 w-full max-w-[360px] items-center"
            >
                <Text className="text-white font-bold text-base">Sign in</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center w-full max-w-[360px] my-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="mx-3 text-xs text-gray-400">Have a place to list?</Text>
                <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Secondary action */}
            <BecomeAHostButton className="w-full max-w-[360px]" />
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