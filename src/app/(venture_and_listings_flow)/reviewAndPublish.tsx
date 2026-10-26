import { ReactNode } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import VentureCardPreview from "@/components/VentureCardPreview";
import { LISTING_TYPE_LABELS, useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { AFRICAN_COUNTRIES } from "@/constants/africaCountries";
import { COUNTRIES } from "@/constants/countryCodes";
import { ID_TYPES, dialCodeOf } from "@/constants/schemas/venture";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { rm, rs, rv } from "@/styles/responsive";

const GREEN = "#064D30";

const Card = ({ title, editRoute, children }: { title: string; editRoute: string; children: ReactNode }) => {
    const router = useRouter();
    return (
        <View className="rounded-2xl border border-gray-200 bg-white" style={{ padding: rs(14), gap: rv(8) }}>
            <View className="flex-row items-center justify-between">
                <AppText variant="caption" weight="semibold" className="uppercase text-gray-500" style={{ letterSpacing: 1 }}>{title}</AppText>
                <TouchableOpacity onPress={() => router.replace(editRoute as Href)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Edit ${title}`}>
                    <AppText variant="small" weight="semibold" className="text-dark-green-ascents">Edit</AppText>
                </TouchableOpacity>
            </View>
            {children}
        </View>
    );
};

const Line = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
    <View className="flex-row items-center" style={{ gap: rs(8) }}>
        <Ionicons name={icon} size={rm(15)} color="#6B7280" />
        <AppText variant="small" style={{ flex: 1 }}>{text}</AppText>
    </View>
);

const NEXT_STEPS = ["Create your free account", "Confirm your email and phone", "A quick ID check", "Your listing goes live"];

const ReviewAndPublishPage = () => {
    const draft = useVentureDraftStore((s) => s.draft);
    const { isLoggedIn } = useAuthContext();

    const coverPhoto = draft.photos?.[0];
    const a = draft.address;
    const countryName = AFRICAN_COUNTRIES.find((c) => c.code === a?.country)?.name ?? "";
    const place = [a?.area, a?.region, countryName].filter(Boolean).join(", ");
    const idLabel = ID_TYPES.find((t) => t.value === draft.idType)?.label ?? "ID";
    const phone = draft.contactPhone?.number
        ? `${dialCodeOf(draft.contactPhone.country)} ${draft.contactPhone.number}`
        : "";
    const flag = COUNTRIES.find((c) => c.code === draft.contactPhone?.country)?.flag ?? "";

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(24) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">One last look</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Check everything is right. Tap Edit to change anything.
                    </AppText>
                </View>

                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(8), gap: rv(14) }}>
                    <Card title="Your listing" editRoute="/listingNameAndDescription">
                        <View className="flex-row" style={{ gap: rs(12) }}>
                            {coverPhoto ? (
                                <Image source={{ uri: coverPhoto.uri }} style={{ width: rm(84), height: rm(84), borderRadius: rm(12) }} contentFit="cover" />
                            ) : null}
                            <View style={{ flex: 1, gap: rv(4) }}>
                                <AppText variant="body" weight="semibold" numberOfLines={2}>{draft.listingName || "Untitled listing"}</AppText>
                                {!!draft.type && <Line icon="home-outline" text={LISTING_TYPE_LABELS[draft.type]} />}
                                {!!place && <Line icon="location-outline" text={place} />}
                                <Line icon="images-outline" text={`${draft.photos?.length ?? 0} photos`} />
                            </View>
                        </View>
                    </Card>

                    <Card title="Your venture" editRoute="/ventureName">
                        <VentureCardPreview name={draft.ventureName} coverUri={draft.ventureCover?.uri} />
                    </Card>

                    <Card title="About you (private)" editRoute="/hostLegalName">
                        <Line icon="person-outline" text={`${draft.legalFirstName ?? ""} ${draft.legalLastName ?? ""}`.trim()} />
                        <Line icon="id-card-outline" text={draft.idNumber ? `${idLabel} provided` : `${idLabel} needed: tap Edit to type it again`} />
                    </Card>

                    <Card title="Contact (private)" editRoute="/hostContactDetails">
                        <Line icon="call-outline" text={phone ? `${flag} ${phone}` : "No phone yet"} />
                        <Line icon="mail-outline" text={draft.contactEmail || "No email yet"} />
                    </Card>

                    <View className="rounded-2xl bg-[#EEF5F0]" style={{ padding: rs(14), gap: rv(8) }}>
                        <AppText variant="small" weight="semibold">What happens next</AppText>
                        {NEXT_STEPS.map((step, i) => (
                            <View key={step} className="flex-row items-center" style={{ gap: rs(10) }}>
                                <View className="items-center justify-center rounded-full bg-dark-green-ascents" style={{ height: rm(22), width: rm(22) }}>
                                    <AppText variant="caption" weight="bold" className="text-white">{i + 1}</AppText>
                                </View>
                                <AppText variant="small" style={{ flex: 1 }}>{step}</AppText>
                            </View>
                        ))}
                        {isLoggedIn && (
                            <View className="flex-row items-center" style={{ gap: rs(6), marginTop: rv(2) }}>
                                <Ionicons name="checkmark-circle" size={rm(14)} color={GREEN} />
                                <AppText variant="caption" className="text-gray-600">You're already signed in, so step 1 is done.</AppText>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default ReviewAndPublishPage;
