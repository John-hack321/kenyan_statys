import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { randomUUID } from "expo-crypto";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import VentureCardPreview from "@/components/VentureCardPreview";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { rm, rs, rv } from "@/styles/responsive";

const GREEN = "#064D30";

const ActionButton = ({ icon, label, onPress, danger }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        className="flex-row items-center justify-center rounded-xl border border-gray-300 bg-white"
        style={{ height: rm(46), paddingHorizontal: rs(16), gap: rs(8) }}
    >
        <Ionicons name={icon} size={rm(18)} color={danger ? "#B3261E" : GREEN} />
        <AppText variant="body" weight="medium" style={{ color: danger ? "#B3261E" : GREEN }}>{label}</AppText>
    </TouchableOpacity>
);

// Optional. A host without a cover photo can just press Next.
const VentureCoverPhotoPage = () => {
    const name = useVentureDraftStore((s) => s.draft.ventureName);
    const cover = useVentureDraftStore((s) => s.draft.ventureCover);
    const firstListingPhoto = useVentureDraftStore((s) => s.draft.photos?.[0]);
    const setDraft = useVentureDraftStore((s) => s.setDraft);

    // the gallery needs no permission on Android (the system photo picker is used)
    const pickFromLibrary = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,       // lets the host crop it to the wide shape guests will see
            aspect: [16, 9],
            quality: 0.8,
        });
        if (result.canceled) return;
        const a = result.assets[0];
        setDraft({ ventureCover: { id: randomUUID(), uri: a.uri, width: a.width, height: a.height } });
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "Allow camera access in your phone settings to take a photo.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [16, 9], quality: 0.8 });
        if (result.canceled) return;
        const a = result.assets[0];
        setDraft({ ventureCover: { id: randomUUID(), uri: a.uri, width: a.width, height: a.height } });
    };

    const openMenu = () =>
        Alert.alert("Cover photo", undefined, [
            { text: "Choose from gallery", onPress: pickFromLibrary },
            { text: "Take a photo", onPress: takePhoto },
            { text: "Cancel", style: "cancel" },
        ]);

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(24) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Add a cover photo</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Optional. It's the first thing guests see on your venture. A logo or your best property works well. You can add it later.
                    </AppText>
                </View>

                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(12), gap: rv(14) }}>
                    <VentureCardPreview name={name} coverUri={cover?.uri} />

                    <View style={{ gap: rv(10) }}>
                        <ActionButton icon="image-outline" label={cover ? "Change photo" : "Add a photo"} onPress={openMenu} />
                        {!cover && !!firstListingPhoto && (
                            <ActionButton
                                icon="sparkles-outline"
                                label="Use my first listing photo"
                                onPress={() => setDraft({ ventureCover: { ...firstListingPhoto, id: randomUUID() } })}
                            />
                        )}
                        {!!cover && <ActionButton icon="trash-outline" label="Remove photo" danger onPress={() => setDraft({ ventureCover: undefined })} />}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default VentureCoverPhotoPage;
