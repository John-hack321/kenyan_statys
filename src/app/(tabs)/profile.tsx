import { Text, View } from "react-native";
import { useState } from 'react';
import { CountryCodePicker } from '@/components/CountryCodePicker';
import { DEFAULT_COUNTRY } from '@/constants/countryCodes';

const Profile = () => {
    const [country, setCountry] = useState(DEFAULT_COUNTRY);

    return (
        <View className="p-5">
            <Text className="text-lg font-bold mb-4">Profile Settings</Text>
            <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">Country Code</Text>
                <CountryCodePicker value={country} onChange={setCountry} />
            </View>
        </View>
    )
}

export default Profile;