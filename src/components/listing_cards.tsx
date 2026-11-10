import { TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { ListingCard as ListingCardType } from "@/app_state/listing_store";
import { useFavouritesStore } from "@/app_state/favourites_store";
import { images } from "@/constants/images";
import { DB_TYPE_LABELS } from "@/constants/listingTypes";
import { formatKes } from "@/constants/schemas/price";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { haptics } from "@/lib/haptics";
import { COLORS } from "@/styles/colors";
import { rm, rs } from "@/styles/responsive";

// Two cards for the home feed. Visual hierarchy (kept deliberately quiet, like the best listing apps):
//   photo first, then ONLY two lines of text:
//     line 1 (strong):  "Apartment in Kasarani"
//     line 2 (muted):   "KSh 2,100 per night  ·  ★ 4.5"
//   Price and rating share one muted line so nothing competes with the photo or the title.
//   The heart sits on the photo and is the future wishlist button (today it only remembers hearts on this phone).
interface CardProps {
    item: ListingCardType;
    onPress?: () => void;
}

// "bedsitter" -> "Bedsitter", "guest_house" -> "Guest house" (old seed types are not in DB_TYPE_LABELS)
const prettyType = (t: string) => DB_TYPE_LABELS[t] ?? t.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const headline = (item: ListingCardType) => {
    const place = item.area ?? item.region;
    return place ? `${prettyType(item.type)} in ${place}` : prettyType(item.type);
};
const priceText = (item: ListingCardType) => `KSh ${formatKes(item.price)} per night`;

const a11yLabel = (item: ListingCardType) =>
    `${headline(item)}, ${priceText(item)}${item.rating !== null ? `, rated ${item.rating.toFixed(1)}` : ""}`;

const Cover = ({ uri, style }: { uri: string | null; style: object }) =>
    uri ? (
        <Image source={{ uri }} style={style} contentFit="cover" transition={150} />
    ) : (
        <View style={[style, { alignItems: "center", justifyContent: "center", backgroundColor: COLORS.greenSoft }]}>
            <Ionicons name="image-outline" size={rm(28)} color={COLORS.faint} />
        </View>
    );

// Guests can tap it: the sign-in sheet opens and the heart is saved right after they log in.
const HeartButton = ({ id }: { id: string }) => {
    const requireAuth = useRequireAuth();
    const active = useFavouritesStore((s) => s.ids.includes(id));
    const toggle = useFavouritesStore((s) => s.toggle);
    return (
        <TouchableOpacity
            onPress={() => requireAuth(() => { haptics.select(); toggle(id); })}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={active ? "Remove from saved" : "Save listing"}
            accessibilityState={{ selected: active }}
            hitSlop={6}
            className="absolute items-center justify-center rounded-full bg-white/90"
            style={{ top: rm(8), right: rm(8), height: rm(36), width: rm(36) }}
        >
            <Ionicons name={active ? "heart" : "heart-outline"} size={rm(20)} color={active ? COLORS.danger : COLORS.ink} />
        </TouchableOpacity>
    );
};

// "KSh 2,100 per night  ·  ★ 4.5" on one muted line. The price may shorten with "…" before the rating ever does.
const MetaLine = ({ item, light }: { item: ListingCardType; light?: boolean }) => {
    const tone = light ? "text-white" : "text-gray-500";
    return (
        <View className="flex-row items-center" style={{ gap: rs(4) }}>
            <AppText variant="small" className={tone} numberOfLines={1} style={{ flexShrink: 1 }}>{priceText(item)}</AppText>
            {item.rating !== null && (
                <>
                    <AppText variant="small" className={tone}>·</AppText>
                    <Ionicons name="star" size={rm(11)} color={light ? COLORS.white : COLORS.ink} />
                    <AppText variant="small" className={tone} style={{ flexShrink: 0 }}>{item.rating.toFixed(1)}</AppText>
                </>
            )}
        </View>
    );
};

export const ListingCard = ({ item, onPress }: CardProps) => {
    if (!item) return null;
    return (
        <View style={{ flex: 1, marginTop: rm(16) }}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.9} accessibilityRole="button" accessibilityLabel={a11yLabel(item)}>
                <Cover uri={item.coverUrl} style={{ aspectRatio: 1, width: "100%", borderRadius: rm(16), overflow: "hidden" }} />
                <View style={{ marginTop: rm(8), gap: rm(1) }}>
                    <AppText variant="body" weight="semibold" numberOfLines={1}>{headline(item)}</AppText>
                    <MetaLine item={item} />
                </View>
            </TouchableOpacity>
            <HeartButton id={item.id} />
        </View>
    );
};

// A tall photo card with a dark fade at the bottom so the white text can always be read. Featured row only.
export const FeaturedCard = ({ item, onPress }: CardProps) => {
    if (!item) return null;
    return (
        <View style={{ width: rm(210), height: rm(250) }}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.9} accessibilityRole="button" accessibilityLabel={a11yLabel(item)} style={{ flex: 1 }}>
                <Cover uri={item.coverUrl} style={{ width: "100%", height: "100%", borderRadius: rm(16), overflow: "hidden" }} />
                <Image
                    source={images.cardGradient}
                    style={{ position: "absolute", bottom: 0, width: "100%", height: "55%", borderBottomLeftRadius: rm(16), borderBottomRightRadius: rm(16) }}
                    contentFit="fill"
                />
                <View style={{ position: "absolute", left: rm(14), right: rm(14), bottom: rm(14), gap: rm(2) }}>
                    <AppText variant="large" weight="bold" className="text-white" numberOfLines={1}>{headline(item)}</AppText>
                    <MetaLine item={item} light />
                </View>
            </TouchableOpacity>
            <HeartButton id={item.id} />
        </View>
    );
};