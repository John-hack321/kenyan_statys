import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import AppText from "@/components/AppText";
import CounterRow from "@/components/CounterRow";
import {
    BasicDetailsType,
    DEFAULT_BASIC_DETAILS,
    LISTING_TYPE_LABELS,
    useVentureDraftStore,
} from "@/app_state/ventureFlowStore";
import { rs, rv } from "@/styles/responsive";

// One entry per row. To add a row: add the field to BasicDetailsType + DEFAULT_BASIC_DETAILS, then one line here.
// Bedrooms can be 0: that is a studio or bedsitter (guests filter by it on the home page).
const FIELDS: { key: keyof BasicDetailsType; label: string; min: number; max: number }[] = [
    { key: "maxGuests", label: "Maximum guests", min: 1, max: 10 },
    { key: "bedrooms", label: "Bedrooms", min: 0, max: 50 },
    { key: "beds", label: "Beds", min: 1, max: 50 },
    { key: "bathrooms", label: "Bathrooms", min: 1, max: 50 },
];

const BasicListingDetailsPage = () => {
    const draft = useVentureDraftStore((s) => s.draft);
    const setDraft = useVentureDraftStore((s) => s.setDraft);

    // Nothing is undefined any more: until the host changes something we show the defaults...
    const details = draft.basicDetails ?? DEFAULT_BASIC_DETAILS;

    // ...and we also save them, so what is on screen is exactly what ends up in the draft.
    useEffect(() => {
        if (!draft.basicDetails) setDraft({ basicDetails: DEFAULT_BASIC_DETAILS });
    }, [draft.basicDetails, setDraft]);

    const update = (key: keyof BasicDetailsType, value: number) =>
        setDraft({ basicDetails: { ...details, [key]: value } });

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(16) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">
                        Tell us more about your {draft.type ? LISTING_TYPE_LABELS[draft.type] : "place"}
                    </AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        You can change these any time later.
                    </AppText>
                </View>

                <View style={{ paddingHorizontal: rs(20) }}>
                    {FIELDS.map((f) => (
                        <CounterRow
                            key={f.key}
                            label={f.label}
                            value={details[f.key]}
                            min={f.min}
                            max={f.max}
                            onChange={(v) => update(f.key, v)}
                        />
                    ))}
                    <AppText variant="caption" className="text-gray-500" style={{ marginTop: rv(10) }}>
                        Choose 0 bedrooms for a studio or a bedsitter.
                    </AppText>
                </View>
            </ScrollView>
        </View>
    );
};

export default BasicListingDetailsPage;