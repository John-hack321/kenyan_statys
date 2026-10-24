import { useEffect, useRef, useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import TextField from "@/components/TextField";
import SelectField from "@/components/SelectField";
import { ListingAddress, useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { AFRICAN_COUNTRIES, COUNTRY_OPTIONS, DEFAULT_COUNTRY_CODE } from "@/constants/africaCountries";
import { MAPS_ENABLED } from "@/constants/featureFlags";

import { KENYA_AREA_SUGGESTIONS,KENYA_COUNTY_OPTIONS, findCounty  } from "@/constants/kenyaPlaces";
import { ListingAddressForm, listingAddressSchema, sanitizeAddressLine, sanitizePlace } from "@/constants/schemas/listing";

import { rm, rs, rv } from "@/styles/responsive";
import { normalizePlaceName } from "@/lib/text";

const GREEN = "#064D30";

const EMPTY: ListingAddressForm = {
    country: DEFAULT_COUNTRY_CODE,
    region: "",
    area: "",
    streetAddress: "",
    buildingName: "",
    unit: "",
    landmark: "",
};

const SectionTitle = ({ title, note, icon }: { title: string; note: string; icon?: keyof typeof Ionicons.glyphMap }) => (
    <View style={{ marginBottom: rv(2) }}>
        <View className="flex-row items-center" style={{ gap: rs(6) }}>
            {icon && <Ionicons name={icon} size={rm(16)} color={GREEN} />}
            <AppText variant="large" weight="semibold">{title}</AppText>
        </View>
        <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(2) }}>{note}</AppText>
    </View>
);

const SuggestionChip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        className={`rounded-full border ${selected ? "bg-dark-green-ascents border-dark-green-ascents" : "bg-white border-gray-300"}`}
        style={{ paddingHorizontal: rs(12), paddingVertical: rv(6) }}
    >
        <AppText variant="caption" weight="medium" className={selected ? "text-white" : "text-black"}>{label}</AppText>
    </TouchableOpacity>
);

const FinalListingDetailsPage = () => {
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const streetRef = useRef<TextInput>(null);
    const buildingRef = useRef<TextInput>(null);
    const unitRef = useRef<TextInput>(null);
    const landmarkRef = useRef<TextInput>(null);
    const [filledFromPin, setFilledFromPin] = useState(false);

    // read once: react-hook-form owns the values while the page is open, the draft is just where we save them
    const initial = useRef(useVentureDraftStore.getState().draft).current;

    const { control, setValue, trigger } = useForm<ListingAddressForm>({
        resolver: zodResolver(listingAddressSchema),
        mode: "onTouched", // errors appear after the host leaves a field, not while they are still typing
        defaultValues: { ...EMPTY, ...initial.address },
    });

    // save to the draft on every change (this also saves the default country on first visit).
    // The step's "Next" check uses the same zod schema as this form.
    const values = useWatch({ control });
    const valuesKey = JSON.stringify(values);
    useEffect(() => {
        setDraft({ address: values as ListingAddress });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valuesKey, setDraft]);

    // coming back to a half-filled page: show the errors for what is already typed
    useEffect(() => {
        const filled = (Object.keys(EMPTY) as (keyof ListingAddressForm)[]).filter(
            (k) => k !== "country" && !!initial.address?.[k]
        );
        if (filled.length) trigger(filled);
    }, [initial, trigger]);

    // The pin from the location page already says where the place is. Ask the phone's own geocoder
    // (no Google key needed) and pre-select the country and county. Only when the host hasn't chosen yet.
    useEffect(() => {
        const coords = initial.listingLocationCordinates;
        if (!MAPS_ENABLED || !coords || initial.address?.region) return;
        let cancelled = false;
        (async () => {
            try {
                const [place] = await Location.reverseGeocodeAsync(coords);
                if (cancelled || !place) return;
                const code = place.isoCountryCode?.toUpperCase();
                if (code && AFRICAN_COUNTRIES.some((c) => c.code === code)) setValue("country", code, { shouldDirty: true });
                if (code === "KE") {
                    const county = findCounty([place.region, place.subregion, place.city]);
                    if (county) {
                        setValue("region", county, { shouldDirty: true, shouldValidate: true });
                        setFilledFromPin(true);
                    }
                }
            } catch {
                // no geocoder on this phone: the host just picks the county themselves
            }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const country = values.country ?? DEFAULT_COUNTRY_CODE;
    const region = values.region ?? "";
    const area = values.area ?? "";
    const isKenya = country === "KE";
    const suggestions = isKenya ? KENYA_AREA_SUGGESTIONS[region] ?? [] : [];

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingBottom: rv(32) }}
            >
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Almost there</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Tell us where your place is so guests can find it in search.
                    </AppText>
                </View>

                {/* ---------- public: used for search ---------- */}
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(12), gap: rv(14) }}>
                    <SectionTitle title="Where is it?" note="Guests see this on your listing and use it to search." />

                    <Controller
                        control={control}
                        name="country"
                        render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <SelectField
                                label="Country / region"
                                title="Select a country"
                                value={value}
                                options={COUNTRY_OPTIONS}
                                error={error?.message}
                                onChange={(code) => {
                                    if (code !== value) {
                                        // a county from one country means nothing in another
                                        setValue("region", "");
                                        setValue("area", "");
                                        setFilledFromPin(false);
                                    }
                                    onChange(code);
                                }}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="region"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) =>
                            isKenya ? (
                                <SelectField
                                    label="County"
                                    title="Select a county"
                                    value={value}
                                    options={KENYA_COUNTY_OPTIONS}
                                    error={error?.message}
                                    helper={filledFromPin ? "Filled in from your pin. Change it if it's not right." : undefined}
                                    onChange={(c) => { setFilledFromPin(false); onChange(c); }}
                                />
                            ) : (
                                <TextField
                                    label="Region / state / province"
                                    value={value}
                                    onChangeText={(t) => onChange(sanitizePlace(t))}
                                    onBlur={() => { onChange(normalizePlaceName(value)); onBlur(); }}
                                    maxLength={50}
                                    error={error?.message}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />
                            )
                        }
                    />

                    <View>
                        <Controller
                            control={control}
                            name="area"
                            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                                <TextField
                                    label="Area / estate"
                                    value={value}
                                    onChangeText={(t) => onChange(sanitizePlace(t))}
                                    onBlur={() => { onChange(normalizePlaceName(value)); onBlur(); }}
                                    placeholder="e.g. Roysambu"
                                    maxLength={50}
                                    error={error?.message}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                    submitBehavior="submit"
                                    onSubmitEditing={() => streetRef.current?.focus()}
                                />
                            )}
                        />
                        {suggestions.length > 0 && (
                            <View className="flex-row flex-wrap" style={{ gap: rs(8), marginTop: rv(10) }}>
                                {suggestions.map((s) => (
                                    <SuggestionChip
                                        key={s}
                                        label={s}
                                        selected={area === s}
                                        onPress={() => setValue("area", s, { shouldDirty: true, shouldValidate: true })}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* ---------- private: only after booking ---------- */}
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(28), gap: rv(14) }}>
                    <SectionTitle
                        icon="lock-closed-outline"
                        title="Exact address"
                        note="Guests only see this after they book."
                    />

                    <Controller
                        control={control}
                        name="streetAddress"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                inputRef={streetRef}
                                label="Street, road or estate"
                                value={value}
                                onChangeText={(t) => onChange(sanitizeAddressLine(t))}
                                onBlur={() => { onChange(value.trim()); onBlur(); }}
                                placeholder="e.g. Off Thika Road, Mirema Drive"
                                maxLength={120}
                                error={error?.message}
                                helper="Many places in Kenya have no street number. A road or estate name is fine."
                                autoCapitalize="words"
                                returnKeyType="next"
                                submitBehavior="submit"
                                onSubmitEditing={() => buildingRef.current?.focus()}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="buildingName"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                inputRef={buildingRef}
                                label="Building name"
                                optional
                                value={value ?? ""}
                                onChangeText={(t) => onChange(sanitizeAddressLine(t))}
                                onBlur={() => { onChange((value ?? "").trim()); onBlur(); }}
                                maxLength={60}
                                error={error?.message}
                                autoCapitalize="words"
                                returnKeyType="next"
                                submitBehavior="submit"
                                onSubmitEditing={() => unitRef.current?.focus()}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="unit"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                inputRef={unitRef}
                                label="Unit, floor or block"
                                optional
                                value={value ?? ""}
                                onChangeText={(t) => onChange(sanitizeAddressLine(t))}
                                onBlur={() => { onChange((value ?? "").trim()); onBlur(); }}
                                placeholder="e.g. Block B, 3rd floor, Door 12"
                                maxLength={40}
                                error={error?.message}
                                returnKeyType="next"
                                submitBehavior="submit"
                                onSubmitEditing={() => landmarkRef.current?.focus()}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="landmark"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                inputRef={landmarkRef}
                                label="Nearby landmark"
                                optional
                                value={value ?? ""}
                                onChangeText={(t) => onChange(sanitizeAddressLine(t))}
                                onBlur={() => { onChange((value ?? "").trim()); onBlur(); }}
                                placeholder="e.g. Opposite Naivas, next to the petrol station"
                                maxLength={80}
                                error={error?.message}
                                helper="Helps guests and boda riders find you."
                                autoCapitalize="sentences"
                                returnKeyType="done"
                            />
                        )}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default FinalListingDetailsPage;