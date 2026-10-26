import { View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { rm, rs, rv } from "@/styles/responsive";

type Props = {
    name?: string;
    coverUri?: string | null;
    listingCount?: number;
};

// How the venture will look to guests. Shown while the host names it and picks a cover, so they see the result.
export default function VentureCardPreview({ name, coverUri, listingCount = 1 }: Props) {
    const initial = (name ?? "").trim().charAt(0).toUpperCase();

    return (
        <View style={{ borderRadius: rm(16), borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "white", overflow: "hidden" }}>
            <View style={{ aspectRatio: 16 / 9, backgroundColor: "#064D30", alignItems: "center", justifyContent: "center" }}>
                {coverUri ? (
                    <Image source={{ uri: coverUri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                ) : initial ? (
                    <AppText variant="display" weight="bold" className="text-white" style={{ opacity: 0.9 }}>{initial}</AppText>
                ) : (
                    <Ionicons name="business-outline" size={rm(40)} color="white" style={{ opacity: 0.7 }} />
                )}
            </View>
            <View style={{ padding: rs(14), gap: rv(4) }}>
                <AppText variant="large" weight="semibold" numberOfLines={1} style={{ color: name?.trim() ? "#111" : "#9CA3AF" }}>
                    {name?.trim() || "Your venture name"}
                </AppText>
                <View className="flex-row items-center" style={{ gap: rs(6) }}>
                    <Ionicons name="home-outline" size={rm(13)} color="#6B7280" />
                    <AppText variant="caption" className="text-gray-500">
                        {listingCount} {listingCount === 1 ? "listing" : "listings"}  ·  New host
                    </AppText>
                </View>
            </View>
        </View>
    );
}
