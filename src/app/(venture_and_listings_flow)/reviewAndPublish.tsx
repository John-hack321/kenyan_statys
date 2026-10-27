import { ReactNode } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import VentureCardPreview from "@/components/VentureCardPreview";
import { LISTING_TYPE_LABELS, useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { useUserStore } from "@/app_state/user_store";
import { AFRICAN_COUNTRIES } from "@/constants/africaCountries";
import { COUNTRIES } from "@/constants/countryCodes";
import { bedroomLabel } from "@/constants/listingTypes";
import { formatKes } from "@/constants/schemas/price";
import { ID_TYPES, dialCodeOf } from "@/constants/schemas/venture";
import { firstIncompleteStep, getFlowSteps, withFromReview } from "@/constants/ventureFlowSteps";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

// Edit opens the page with ?from=review, so after "Done" the host comes straight back here.
const Card = ({ title, editRoute, children }: { title: string; editRoute: string; children: ReactNode }) => {
    const router = useRouter();
    return (
        <View className="rounded-2xl border border-gray-200 bg-white" style={{ padding: rs(14), gap: rv(8) }}>
            <View className="flex-row items-center justify-between">
                <AppText variant="caption" weight="semibold" className="uppercase text-gray-500" style={{ letterSpacing: 1 }}>{title}</AppText>
                <TouchableOpacity onPress={() => router.replace(withFromReview(editRoute) as Href)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Edit ${title}`}>
                    <AppText variant="small" weight="semibold" className="text-dark-green-ascents">Edit</AppText>
                </TouchableOpacity>
            </View>
            {children}
        </View>
    );
};

const Line = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
    <View className="flex-row items-center" style={{ gap: rs(8) }}>
        <Ionicons name={icon} size={rm(15)} color={COLORS.muted} />
        <AppText variant="small" style={{ flex: 1 }}>{text}</AppText>
    </View>
);

const NEW_HOST_STEPS = ["Create your free account", "Confirm your email and phone", "A quick ID check", "Your listing goes live"];
const EXISTING_HOST_STEPS = ["We save your new listing", "It goes live once your host profile is verified"];

const ReviewAndPublishPage = () => {
    const router = useRouter();
    const draft = useVentureDraftStore((s) => s.draft);
    const hasVenture = useUserStore((s) => s.ventureId !== null);
    const { isLoggedIn } = useAuthContext();

    // what is still missing? (the Finish button stays off until nothing is)
    const missing = firstIncompleteStep(getFlowSteps(hasVenture), draft);

    const coverPhoto = draft.photos?.[0];
    const a = draft.address;
    const countryName = AFRICAN_COUNTRIES.find((c) => c.code === a?.country)?.name ?? "";
    const place = [a?.area, a?.region, countryName].filter(Boolean).join(", ");
    const idLabel = ID_TYPES.find((t) => t.value === draft.idType)?.label ?? "ID";
    const phone = draft.contactPhone?.number
        ? `${dialCodeOf(draft.contactPhone.country)} ${draft.contactPhone.number}`
        : "";
    const flag = COUNTRIES.find((c) => c.code === draft.contactPhone?.country)?.flag ?? "";
    const size = [draft.basicDetails ? bedroomLabel(draft.basicDetails.bedrooms) : "", draft.type ? LISTING_TYPE_LABELS[draft.type] : ""]
        .filter(Boolean).join(" · ");
    const nextSteps = hasVenture ? EXISTING_HOST_STEPS : NEW_HOST_STEPS;

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
                    {missing && (
                        <View className="flex-row items-center rounded-2xl bg-warning-soft" style={{ padding: rs(14), gap: rs(10) }}>
                            <Ionicons name="alert-circle-outline" size={rm(20)} color={COLORS.warning} />
                            <View style={{ flex: 1 }}>
                                <AppText variant="small" weight="semibold">Still needed: {missing.label}</AppText>
                                <AppText variant="caption" className="text-gray-600">
                                    Some details were not saved on your phone, like your ID number and phone. Add them again to continue.
                                </AppText>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.replace(withFromReview(missing.route) as Href)}
                                accessibilityRole="button"
                                className="rounded-full bg-dark-green-ascents"
                                style={{ paddingHorizontal: rs(14), paddingVertical: rv(7) }}
                            >
                                <AppText variant="small" weight="semibold" className="text-white">Fix</AppText>
                            </TouchableOpacity>
                        </View>
                    )}

                    <Card title="Your listing" editRoute="/listingNameAndDescription">
                        <View className="flex-row" style={{ gap: rs(12) }}>
                            {coverPhoto ? (
                                <Image source={{ uri: coverPhoto.uri }} style={{ width: rm(84), height: rm(84), borderRadius: rm(12) }} contentFit="cover" />
                            ) : null}
                            <View style={{ flex: 1, gap: rv(4) }}>
                                <AppText variant="body" weight="semibold" numberOfLines={2}>{draft.listingName || "Untitled listing"}</AppText>
                                {!!size && <Line icon="home-outline" text={size} />}
                                {!!draft.pricePerNight && <Line icon="cash-outline" text={`KSh ${formatKes(draft.pricePerNight)} per night`} />}
                                {!!place && <Line icon="location-outline" text={place} />}
                                <Line icon="images-outline" text={`${draft.photos?.length ?? 0} photos`} />
                            </View>
                        </View>
                    </Card>

                    {!hasVenture && (
                        <>
                            <Card title="Your venture" editRoute="/ventureName">
                                <VentureCardPreview name={draft.ventureName} coverUri={draft.ventureCover?.uri} />
                            </Card>

                            <Card title="About you (private)" editRoute="/hostLegalName">
                                <Line icon="person-outline" text={`${draft.legalFirstName ?? ""} ${draft.legalLastName ?? ""}`.trim()} />
                                <Line icon="id-card-outline" text={draft.idNumber ? `${idLabel} provided` : `${idLabel} needed: tap Edit to type it again`} />
                            </Card>

                            <Card title="Contact (private)" editRoute="/hostContactDetails">
                                <Line icon="call-outline" text={phone ? `${flag} ${phone}` : "No phone yet: tap Edit to type it again"} />
                                <Line icon="mail-outline" text={draft.contactEmail || "No email yet"} />
                            </Card>
                        </>
                    )}

                    <View className="rounded-2xl bg-gray-50 border border-gray-200" style={{ padding: rs(14), gap: rv(8) }}>
                        <AppText variant="small" weight="semibold" className="text-dark-green-ascents">What happens next</AppText>
                        {nextSteps.map((step, i) => (
                            <View key={step} className="flex-row items-center" style={{ gap: rs(10) }}>
                                <View className="items-center justify-center rounded-full bg-gray-200" style={{ height: rm(22), width: rm(22) }}>
                                    <AppText variant="caption" weight="bold" className="text-dark-green-ascents">{i + 1}</AppText>
                                </View>
                                <AppText variant="small" style={{ flex: 1 }}>{step}</AppText>
                            </View>
                        ))}
                        {isLoggedIn && !hasVenture && (
                            <View className="flex-row items-center" style={{ gap: rs(6), marginTop: rv(2) }}>
                                <Ionicons name="checkmark-circle" size={rm(14)} color={COLORS.muted} />
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
