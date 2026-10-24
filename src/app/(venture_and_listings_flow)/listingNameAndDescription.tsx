import { useEffect, useRef } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import TextField from "@/components/TextField";
import { LISTING_TYPE_LABELS, useVentureDraftStore } from "@/app_state/ventureFlowStore";
import {
    DESCRIPTION_MAX,
    DESCRIPTION_MIN,
    LISTING_NAME_MAX,
    ListingTextForm,
    listingTextSchema,
    sanitizeDescription,
    sanitizeListingName,
} from "@/constants/schemas/listing";

import { rm, rs, rv } from "@/styles/responsive";

const TIPS = [
    "The neighbourhood and how guests get there (matatu, boda, Uber)",
    "How reliable the water, power and wifi are",
    "What makes it special: a view, quiet, security, shops nearby",
    "House rules guests should know about",
];

const ListingNameAndDescriptionPage = () => {
    const type = useVentureDraftStore((s) => s.draft.type);
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const descriptionRef = useRef<TextInput>(null);

    // read once: react-hook-form owns the values while the page is open, the draft is just where we save them
    const initial = useRef(useVentureDraftStore.getState().draft).current;

    const { control, trigger } = useForm<ListingTextForm>({
        resolver: zodResolver(listingTextSchema),
        mode: "onTouched", // errors appear after the host leaves a field, not while they are still typing
        defaultValues: {
            listingName: initial.listingName ?? "",
            listingDescription: initial.listingDescription ?? "",
        },
    });

    // save to the draft on every change. The step's "Next" check uses the same zod schema as this form.
    const values = useWatch({ control });
    useEffect(() => {
        setDraft({ listingName: values.listingName ?? "", listingDescription: values.listingDescription ?? "" });
    }, [values.listingName, values.listingDescription, setDraft]);

    // coming back to a half-filled page: show the errors for what is already typed
    useEffect(() => {
        if (initial.listingName) trigger("listingName");
        if (initial.listingDescription) trigger("listingDescription");
    }, [initial, trigger]);

    const typeLabel = type ? LISTING_TYPE_LABELS[type] : "place";

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingBottom: rv(24) }}
            >
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Name and describe your {typeLabel}</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        This is the first thing guests read. You can change it any time later.
                    </AppText>
                </View>

                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(8), gap: rv(18) }}>
                    <Controller
                        control={control}
                        name="listingName"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                label="Listing title"
                                value={value}
                                onChangeText={(t) => onChange(sanitizeListingName(t))}
                                onBlur={() => { onChange(value.trim()); onBlur(); }}
                                placeholder={`e.g. Cosy ${typeLabel} near Westlands`}
                                maxLength={LISTING_NAME_MAX}
                                showCounter
                                error={error?.message}
                                helper="Short and specific works best."
                                autoCapitalize="sentences"
                                returnKeyType="next"
                                submitBehavior="submit"
                                onSubmitEditing={() => descriptionRef.current?.focus()}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="listingDescription"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                inputRef={descriptionRef}
                                label="Description"
                                value={value}
                                onChangeText={(t) => onChange(sanitizeDescription(t))}
                                onBlur={() => { onChange(value.trim()); onBlur(); }}
                                placeholder={
                                    "Describe what makes your place special: the neighbourhood, how to get there, what is nearby, " +
                                    "and anything guests should know before they book."
                                }
                                multiline
                                minHeight={rv(200)}
                                maxLength={DESCRIPTION_MAX}
                                showCounter
                                error={error?.message}
                                helper={
                                    value.trim().length < DESCRIPTION_MIN
                                        ? `At least ${DESCRIPTION_MIN} characters. Guests message you through the app, so leave out phone numbers and links.`
                                        : "Guests message you through the app, so leave out phone numbers and links."
                                }
                                autoCapitalize="sentences"
                            />
                        )}
                    />

                    <View className="rounded-2xl bg-[#EEF5F0]" style={{ padding: rs(14), gap: rv(6) }}>
                        <View className="flex-row items-center" style={{ gap: rs(8) }}>
                            <Ionicons name="bulb-outline" size={rm(18)} color="#064D30" />
                            <AppText variant="small" weight="semibold">What to mention</AppText>
                        </View>g
                        {TIPS.map((tip) => (
                            <AppText key={tip} variant="small" className="text-gray-700">{"•  " + tip}</AppText>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default ListingNameAndDescriptionPage;