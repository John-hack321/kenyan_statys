import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/AppText";
import { rm, rs, rv } from "@/styles/responsive";

type Coords = { latitude: number; longitude: number };

type Props = {
    visible: boolean;
    initial?: Coords;                       // the pin saved earlier, if any
    onClose: () => void;
    onConfirm: (coords: Coords) => void;
};

const GREEN = "#064D30";
const PIN_SIZE = 44;
const NAIROBI: Coords = { latitude: -1.2921, longitude: 36.8219 };

const toRegion = (c: Coords, delta: number): Region => ({ ...c, latitudeDelta: delta, longitudeDelta: delta });

// A full-screen window: the PIN stays in the middle, the host drags the MAP underneath it.
// Whatever is under the pin when they press Confirm is the listing location.
export default function LocationPickerModal({ visible, initial, onClose, onConfirm }: Props) {
    const mapRef = useRef<MapView>(null);
    const [center, setCenter] = useState<Coords>(initial ?? NAIROBI);
    const [moving, setMoving] = useState(false);          // pin lifts while the map is being dragged
    const [locating, setLocating] = useState(false);
    const [locationGranted, setLocationGranted] = useState(false);

    // every time the window opens, start from the saved pin (or Nairobi)
    useEffect(() => {
        if (visible) setCenter(initial ?? NAIROBI);
    }, [visible, initial]);

    const locate = async () => {
        try {
            setLocating(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Location permission needed", "Allow location access in your phone settings, or drag the map to place the pin.");
                return;
            }
            setLocationGranted(true);
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const here = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            mapRef.current?.animateToRegion(toRegion(here, 0.002), 600);
            setCenter(here);

            const accuracy = pos.coords.accuracy ?? 0;
            if (accuracy > 50) {
                Alert.alert(
                    "Location isn't very accurate yet",
                    `Your phone says it is within about ${Math.round(accuracy)} m. Check the pin and drag the map if it needs adjusting.`
                );
            }
        } catch {
            Alert.alert("Couldn't get your location", "Make sure location is turned on, or drag the map to place the pin.");
        } finally {
            setLocating(false);
        }
    };

    // ask first: the phone location is only right if the host is actually at the listing
    const useMyLocation = () =>
        Alert.alert(
            "Are you at your place right now?",
            "Stand in front of your listing for the most accurate pin. If you're somewhere else, drag the map instead.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes, use my location", onPress: locate },
            ]
        );

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView className="flex-1 bg-white">
                {/* header */}
                <View className="flex-row items-center justify-between" style={{ paddingHorizontal: rs(16), paddingVertical: rv(10) }}>
                    <TouchableOpacity
                        onPress={onClose}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Close map"
                        className="items-center justify-center rounded-full border border-gray-300"
                        style={{ height: rm(36), width: rm(36) }}
                    >
                        <Ionicons name="close" size={rm(20)} color="#111" />
                    </TouchableOpacity>
                    <AppText variant="large" weight="semibold">Pin your listing</AppText>
                    <View style={{ width: rm(36) }} />
                </View>

                {/* map + fixed pin */}
                <View className="flex-1">
                    <MapView
                        ref={mapRef}
                        provider="google"
                        style={StyleSheet.absoluteFill}
                        initialRegion={initial ? toRegion(initial, 0.004) : toRegion(NAIROBI, 0.09)}
                        showsUserLocation={locationGranted}
                        showsMyLocationButton={false}
                        toolbarEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                        showsCompass={false}
                        onPanDrag={() => setMoving(true)}
                        onRegionChangeComplete={(r) => {
                            setCenter({ latitude: r.latitude, longitude: r.longitude });
                            setMoving(false);
                        }}
                    />

                    {/* small dot marking the exact spot the pin points at */}
                    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]} className="items-center justify-center">
                        <View className="rounded-full bg-black/30" style={{ height: rm(8), width: rm(8) }} />
                    </View>

                    {/* the pin: its tip sits on the centre of the map */}
                    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]} className="items-center justify-center">
                        <View style={{ marginBottom: rm(PIN_SIZE) + (moving ? rm(10) : 0) }}>
                            <Ionicons name="location" size={rm(PIN_SIZE)} color={GREEN} />
                        </View>
                    </View>
                </View>

                {/* actions */}
                <View className="border-t border-gray-200 bg-white" style={{ padding: rs(16), gap: rv(10) }}>
                    <AppText variant="small" className="text-gray-500 text-center">
                        Drag the map until the pin is on your place.
                    </AppText>

                    <TouchableOpacity
                        onPress={useMyLocation}
                        disabled={locating}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        className="flex-row items-center justify-center rounded-xl border border-gray-300 bg-white"
                        style={{ height: rm(46), gap: rs(8) }}
                    >
                        {locating ? (
                            <ActivityIndicator size="small" color={GREEN} />
                        ) : (
                            <Ionicons name="locate-outline" size={rm(18)} color={GREEN} />
                        )}
                        <AppText variant="body" weight="medium" className="text-dark-green-ascents">
                            Use my current location
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onConfirm(center)}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        className="items-center justify-center rounded-xl bg-dark-green-ascents"
                        style={{ height: rm(48) }}
                    >
                        <AppText variant="large" weight="bold" className="text-white">Confirm location</AppText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}