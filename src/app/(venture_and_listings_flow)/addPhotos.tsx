import { Alert, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import Sortable, { SortableGridRenderItem } from "react-native-sortables";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { randomUUID } from "expo-crypto";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { DraftPhoto, useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { MAX_PHOTOS, MIN_PHOTOS } from "@/constants/listingLimits";
import { rm, rs, rv } from "@/styles/responsive";

const GAP = 12;

// The first photo in the draft is the listing cover. Hold a photo and drag to rearrange.
// The array order in the draft store IS the order guests will see.
const AddPhotosPage = () => {
    const photos = useVentureDraftStore((s) => s.draft.photos) ?? [];
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const { width } = useWindowDimensions();

    const sidePadding = rs(20);
    const gap = rs(GAP);
    const tileWidth = (width - sidePadding * 2 - gap) / 2;

    // read the latest photos from the store (the picker is async, so a captured copy could be stale)
    const currentPhotos = () => useVentureDraftStore.getState().draft.photos ?? [];

    const addAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
        const existing = currentPhotos();
        const known = new Set(existing.map((p) => p.uri));
        const fresh: DraftPhoto[] = assets
            .filter((a) => !known.has(a.uri))
            .map((a) => ({ id: randomUUID(), uri: a.uri, width: a.width, height: a.height }));
        setDraft({ photos: [...existing, ...fresh].slice(0, MAX_PHOTOS) });
    };

    // the gallery needs no permission on Android (the system photo picker is used)
    const pickFromLibrary = async () => {
        const remaining = MAX_PHOTOS - currentPhotos().length;
        if (remaining <= 0) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            selectionLimit: remaining,
            quality: 0.8,
        });
        if (!result.canceled) addAssets(result.assets);
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "Allow camera access in your phone settings to take photos.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (!result.canceled) addAssets(result.assets);
    };

    const openAddMenu = () =>
        Alert.alert("Add photos", undefined, [
            { text: "Choose from gallery", onPress: pickFromLibrary },
            { text: "Take a photo", onPress: takePhoto },
            { text: "Cancel", style: "cancel" },
        ]);

    const makeCover = (id: string) => {
        const list = currentPhotos();
        const picked = list.find((p) => p.id === id);
        if (picked) setDraft({ photos: [picked, ...list.filter((p) => p.id !== id)] });
    };

    const removePhoto = (id: string) => setDraft({ photos: currentPhotos().filter((p) => p.id !== id) });

    const openPhotoMenu = (photo: DraftPhoto, index: number) =>
        Alert.alert("Photo options", undefined, [
            ...(index !== 0 ? [{ text: "Make cover photo", onPress: () => makeCover(photo.id) }] : []),
            { text: "Remove photo", style: "destructive" as const, onPress: () => removePhoto(photo.id) },
            { text: "Cancel", style: "cancel" as const },
        ]);

    const renderItem: SortableGridRenderItem<DraftPhoto> = ({ item, index }) => (
        <View className="overflow-hidden rounded-2xl bg-gray-100" style={{ aspectRatio: 1 }}>
            <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />

            {index === 0 && (
                <View
                    className="absolute rounded-full bg-white"
                    style={{ top: rm(10), left: rm(10), paddingHorizontal: rs(10), paddingVertical: rv(4) }}
                >
                    <AppText variant="caption" weight="semibold">Cover</AppText>
                </View>
            )}

            <TouchableOpacity
                onPress={() => openPhotoMenu(item, index)}
                activeOpacity={0.8}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Photo options"
                className="absolute items-center justify-center rounded-full bg-white"
                style={{ top: rm(8), right: rm(8), height: rm(30), width: rm(30) }}
            >
                <Ionicons name="ellipsis-horizontal" size={rm(16)} color="#111" />
            </TouchableOpacity>
        </View>
    );

    const isEmpty = photos.length === 0;

    return (
        <View className="flex-1 bg-white">
            <Animated.ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: rv(24) }}
            >
                <View style={{ paddingHorizontal: sidePadding, paddingTop: rv(20), paddingBottom: rv(12) }}>
                    <AppText variant="title">Add your listing photos</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Add at least {MIN_PHOTOS} photos. Lead with your best one: the first photo is your cover.
                    </AppText>
                    {photos.length > 0 && (
                        <View className="flex-row items-center" style={{ marginTop: rv(10), gap: rs(6) }}>
                            <Ionicons name="move-outline" size={rm(14)} color="#6B7280" />
                            <AppText variant="caption" className="text-gray-500">
                                Hold and drag a photo to rearrange. {photos.length} of {MAX_PHOTOS} added.
                            </AppText>
                        </View>
                    )}
                </View>

                <View style={{ paddingHorizontal: sidePadding }}>
                    {photos.length > 0 && (
                        <Sortable.Grid
                            columns={2}
                            rowGap={gap}
                            columnGap={gap}
                            data={photos}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            scrollableRef={scrollRef}
                            onDragEnd={({ data }: { data: DraftPhoto[] }) => setDraft({ photos: data })}
                        />
                    )}

                    {photos.length < MAX_PHOTOS && (
                        <TouchableOpacity
                            onPress={openAddMenu}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="Add photos"
                            className="items-center justify-center rounded-2xl border border-dashed border-gray-400 bg-white"
                            style={{
                                width: isEmpty ? "100%" : tileWidth,
                                height: isEmpty ? rv(200) : tileWidth,
                                marginTop: photos.length > 0 ? gap : 0,
                                gap: rv(8),
                            }}
                        >
                            <Ionicons name="add" size={rm(isEmpty ? 40 : 32)} color="#111" />
                            <AppText variant="small" weight="semibold">{isEmpty ? "Add photos" : "Add more"}</AppText>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.ScrollView>
        </View>
    );
};

export default AddPhotosPage;