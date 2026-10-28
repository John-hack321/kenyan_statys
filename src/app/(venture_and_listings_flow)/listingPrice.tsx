import { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import SuggestionChip from "@/components/SuggestionChip";
import TextField from "@/components/TextField";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { PRICE_DEFAULT, PRICE_MAX, PRICE_MIN, PRICE_SUGGESTIONS } from "@/constants/listingLimits";
import { PriceForm, formatKes, priceFormSchema, sanitizePrice } from "@/constants/schemas/price";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

// Price per night in KES. Check-in 3 PM and check-out 11 AM are the defaults (hosts will be able to change
// them in v0.0.2), so a 2 night stay runs from 3 PM on day one to 11 AM on day three.
const ListingPricePage = () => {
    const setDraft = useVentureDraftStore((s) => s.setDraft);

    // read once: react-hook-form owns the value while the page is open, the draft is just where we save it
    const initial = useRef(useVentureDraftStore.getState().draft).current;

    const { control, setValue, trigger } = useForm<PriceForm>({
        resolver: zodResolver(priceFormSchema),
        mode: "onTouched",
        defaultValues: { price: String(initial.pricePerNight ?? PRICE_DEFAULT) },
    });

    // save on every change (this also saves the starting price on first visit)
    const values = useWatch({ control });
    const price = values.price ?? "";
    useEffect(() => {
        setDraft({ pricePerNight: price ? Number(price) : undefined });
    }, [price, setDraft]);

    useEffect(() => { if (initial.pricePerNight) trigger("price"); }, [initial, trigger]);

    const fill = (n: number) => setValue("price", String(n), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    const amount = Number(price);

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingBottom: rv(24) }}
            >
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Set your price</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        This is what guests pay for one night. You can change it any time later.
                    </AppText>
                </View>

                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(8), gap: rv(14) }}>
                    <Controller
                        control={control}
                        name="price"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                label="Price per night (KSh)"
                                value={value}
                                onChangeText={(t) => onChange(sanitizePrice(t))}
                                onBlur={onBlur}
                                placeholder={String(PRICE_DEFAULT)}
                                maxLength={6}
                                keyboardType="number-pad"
                                error={error?.message}
                                helper={`Between KSh ${formatKes(PRICE_MIN)} and KSh ${formatKes(PRICE_MAX)}.`}
                                returnKeyType="done"
                            />
                        )}
                    />

                    {amount >= PRICE_MIN && amount <= PRICE_MAX && (
                        <View className="rounded-2xl border border-gray-200 bg-white items-center" style={{ padding: rs(16) }}>
                            <AppText variant="caption" className="text-gray-500">Guests will see</AppText>
                            <AppText variant="heading" weight="bold" style={{ marginTop: rv(2) }}>KSh {formatKes(amount)}</AppText>
                            <AppText variant="small" className="text-gray-500">per night</AppText>
                        </View>
                    )}

                    <View>
                        <AppText variant="caption" weight="medium" className="text-gray-500" style={{ marginBottom: rv(8) }}>
                            QUICK PICKS
                        </AppText>
                        <View className="flex-row flex-wrap" style={{ gap: rs(8) }}>
                            {PRICE_SUGGESTIONS.map((n) => (
                                <SuggestionChip key={n} label={`KSh ${formatKes(n)}`} selected={amount === n} onPress={() => fill(n)} />
                            ))}
                        </View>
                    </View>

                    <View className="flex-row rounded-2xl bg-[#EEF5F0]" style={{ padding: rs(14), gap: rs(10) }}>
                        <Ionicons name="time-outline" size={rm(18)} color={COLORS.green} />
                            <AppText variant="small" className="text-gray-700" style={{ flex: 1 }}>
                            Check-in is from 3 PM and check-out is by 11 AM. Two nights means one full day in between.
                        </AppText>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default ListingPricePage;
