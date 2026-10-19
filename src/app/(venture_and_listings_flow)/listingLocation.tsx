import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import LocationPickerModal from "@/components/LocationPickerModal";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { MAPS_ENABLED } from "@/constants/featureFlags";
import { rm, rs, rv } from "@/styles/responsive";

const GREEN = "#064D30";

const ListingLocationPage = () => {
    const coords = useVentureDraftStore((s) => s.draft.listingLocationCordinates);
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const [pickerOpen, setPickerOpen] = useState(false);

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(16) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Pin the location of your listing</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Guests only see the exact location after they book.
                    </AppText>
                </View>

                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(12) }}>
                    {!MAPS_ENABLED ? (
                        // map switched off in constants/featureFlags.ts
                        <View
                            className="items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50"
                            style={{ height: rv(200), padding: rs(20), gap: rv(8) }}
                        >
                            <Ionicons name="map-outline" size={rm(32)} color="#9CA3AF" />
                            <AppText variant="body" weight="medium" className="text-center">Map pinning is coming soon</AppText>
                            <AppText variant="small" className="text-gray-500 text-center">You can continue without it for now.</AppText>
                        </View>
                    ) : coords ? (
                        <>
                            {/* small static preview of the saved pin (lite mode = a picture, not a live map) */}
                            <View className="overflow-hidden rounded-2xl border border-gray-200" style={{ height: rv(220) }}>
                                <View style={{ flex: 1, pointerEvents: "none" }}>
                                    <MapView
                                        provider="google"
                                        liteMode
                                        style={{ flex: 1 }}
                                        region={{ ...coords, latitudeDelta: 0.004, longitudeDelta: 0.004 }}
                                        toolbarEnabled={false}
                                    >
                                        <Marker coordinate={coords} />
                                    </MapView>
                                </View>
                                <View
                                    className="absolute flex-row items-center rounded-full bg-white"
                                    style={{ left: rm(10), bottom: rm(10), paddingHorizontal: rs(10), paddingVertical: rv(5), gap: rs(5) }}
                                >
                                    <Ionicons name="checkmark-circle" size={rm(14)} color={GREEN} />
                                    <AppText variant="caption" weight="semibold">Location pinned</AppText>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => setPickerOpen(true)}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                className="flex-row items-center justify-center self-start rounded-xl border border-gray-300"
                                style={{ marginTop: rv(12), height: rm(42), paddingHorizontal: rs(16), gap: rs(8) }}
                            >
                                <Ionicons name="create-outline" size={rm(16)} color="#111" />
                                <AppText variant="small" weight="semibold">Change location</AppText>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setPickerOpen(true)}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="Pin your location on the map"
                            className="items-center justify-center rounded-2xl border border-dashed border-gray-400"
                            style={{ height: rv(220), padding: rs(20), gap: rv(8) }}
                        >
                            <Ionicons name="location-outline" size={rm(36)} color={GREEN} />
                            <AppText variant="large" weight="semibold" className="text-center">Pin your location on the map</AppText>
                            <AppText variant="small" className="text-gray-500 text-center">
                                Drag the map to your place, or use your phone's location if you're there now.
                            </AppText>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {MAPS_ENABLED && (
                <LocationPickerModal
                    visible={pickerOpen}
                    initial={coords}
                    onClose={() => setPickerOpen(false)}
                    onConfirm={(c) => {
                        setDraft({ listingLocationCordinates: c });
                        setPickerOpen(false);
                    }}
                />
            )}
        </View>
    );
};

export default ListingLocationPage;