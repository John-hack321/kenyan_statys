import { useEffect, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { Controller, ControllerFieldState, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import PlaceSearchField from "@/components/PlaceSearchField";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";
import { ListingAddress, useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY_CODE } from "@/constants/africaCountries";
import { GAZETTEER_ENABLED } from "@/constants/featureFlags";
import {
    ListingAddressForm,
    listingAddressSchema,
    sanitizeAddressLine,
    sanitizePlace,
} from "@/constants/schemas/listing";
import { PlaceResult, distanceKm, fetchRegions } from "@/lib/places";
import { normalizePlaceName } from "@/lib/text";
import { rm, rs, rv } from "@/styles/responsive";

const GREEN = "#064D30";
const PIN_FAR_KM = 25; // warn (never block) when the pin is further than this from the chosen place

const EMPTY: ListingAddressForm = {
    country: DEFAULT_COUNTRY_CODE,
    region: "",
    area: "",
    streetAddress: "",
    buildingName: "",
    unit: "",
    landmark: "",
};

// A field shows its error only after the host has left it, or once it has text. Never on a field nobody touched.
const shownError = (fs: ControllerFieldState, value?: string) =>
    fs.isTouched || !!value ? fs.error?.message : undefined;

const SectionTitle = ({ title, note, icon }: { title: string; note: string; icon?: keyof typeof Ionicons.glyphMap }) => (
    <View style={{ marginBottom: rv(2) }}>
        <View className="flex-row items-center" style={{ gap: rs(6) }}>
            {icon && <Ionicons name={icon} size={rm(16)} color={GREEN} />}
            <AppText variant="large" weight="semibold">{title}</AppText>
        </View>
        <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(2) }}>{note}</AppText>
    </View>
);

const FinalListingDetailsPage = () => {
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const areaRef = useRef<TextInput>(null);
    const streetRef = useRef<TextInput>(null);
    const buildingRef = useRef<TextInput>(null);
    const unitRef = useRef<TextInput>(null);
    const landmarkRef = useRef<TextInput>(null);
    const [pinWarning, setPinWarning] = useState<string | null>(null);
    const [regions, setRegions] = useState<string[]>([]);

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

    const country = values.country ?? DEFAULT_COUNTRY_CODE;
    const region = values.region ?? "";
    const areaPicked = values.areaPlaceId != null;
    const areaIsNew = values.areaIsNew === true;
    const areaChosen = areaPicked || areaIsNew;

    // A host-added area needs a region. List the regions we have for this country (whatever it calls them).
    useEffect(() => {
        if (!GAZETTEER_ENABLED || !areaIsNew) return;
        let cancelled = false;
        fetchRegions(country)
            .then((r) => { if (!cancelled) setRegions(r); })
            .catch(() => { if (!cancelled) setRegions([]); }); // no list: the host types the region
        return () => { cancelled = true; };
    }, [country, areaIsNew]);

    // ---------- a place picked from our table: its region comes with it ----------
    const handlePickPlace = (p: PlaceResult) => {
        setValue("area", p.name.slice(0, 50), { shouldDirty: true, shouldValidate: true });
        setValue("areaPlaceId", p.id, { shouldDirty: true });
        setValue("areaIsNew", false, { shouldDirty: true });
        setValue("region", (p.admin1 ?? "").slice(0, 50), { shouldDirty: true, shouldValidate: true });

        // soft check: if the pin is far from the place they picked, tell them. Never blocks.
        const pin = useVentureDraftStore.getState().draft.listingLocationCordinates;
        if (pin) {
            const km = distanceKm(pin, { latitude: p.lat, longitude: p.lng });
            setPinWarning(km > PIN_FAR_KM ? `Your pin is about ${Math.round(km)} km from ${p.name}. Check the pin or the place.` : null);
        } else {
            setPinWarning(null);
        }
    };

    // ---------- a place the host added because it wasn't in the table ----------
    const handleAddNewArea = (name: string) => {
        setValue("area", normalizePlaceName(name).slice(0, 50), { shouldDirty: true, shouldValidate: true });
        setValue("areaPlaceId", undefined, { shouldDirty: true });
        setValue("areaIsNew", true, { shouldDirty: true });
        setPinWarning(null);
    };

    const regionField = (
        <Controller
            control={control}
            name="region"
            render={({ field: { value, onChange, onBlur }, fieldState }) =>
                GAZETTEER_ENABLED && areaIsNew && regions.length > 0 ? (
                    <SelectField
                        label="Region"
                        title="Select a region"
                        value={value}
                        options={regions.map((r) => ({ value: r, label: r }))}
                        error={shownError(fieldState)}
                        helper="The region this place is in."
                        onChange={onChange}
                    />
                ) : (
                    <TextField
                        label="Region"
                        value={value ?? ""}
                        onChangeText={(t) => onChange(sanitizePlace(t))}
                        onBlur={() => { onChange(normalizePlaceName(value ?? "")); onBlur(); }}
                        placeholder="e.g. Nairobi"
                        maxLength={50}
                        error={shownError(fieldState, value)}
                        helper="County, state or province, whatever your country calls it."
                        autoCapitalize="words"
                        returnKeyType="next"
                        submitBehavior="submit"
                        onSubmitEditing={() => areaRef.current?.focus()}
                    />
                )
            }
        />
    );

    const areaField = GAZETTEER_ENABLED ? (
        <View>
            <Controller
                control={control}
                name="area"
                render={({ field: { value, onChange, onBlur }, fieldState }) => (
                    <PlaceSearchField
                        inputRef={areaRef}
                        label="City, town or area"
                        value={value}
                        country={country}
                        chosen={areaChosen}
                        error={fieldState.isTouched ? fieldState.error?.message : undefined}
                        helper={
                            areaPicked ? (region ? `In ${region}` : "Matched to our places list.")
                            : areaIsNew ? "New place. Choose the region it is in below."
                            : undefined
                        }
                        onBlur={onBlur}
                        onChangeText={(t) => {
                            // typing again means the earlier pick no longer applies
                            onChange(sanitizePlace(t));
                            if (areaPicked) setValue("region", "");   // that region came from the old pick
                            setValue("areaPlaceId", undefined);
                            setValue("areaIsNew", false);
                            setPinWarning(null);
                        }}
                        onPick={handlePickPlace}
                        onAddNew={handleAddNewArea}
                        onSubmitEditing={() => streetRef.current?.focus()}
                    />
                )}
            />
            {pinWarning && (
                <View className="flex-row items-center" style={{ marginTop: rv(8), gap: rs(6) }}>
                    <Ionicons name="warning-outline" size={rm(14)} color="#B45309" />
                    <AppText variant="caption" style={{ color: "#B45309", flex: 1 }}>{pinWarning}</AppText>
                </View>
            )}
        </View>
    ) : (
        // places table switched off: the host types the area
        <Controller
            control={control}
            name="area"
            render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <TextField
                    inputRef={areaRef}
                    label="City, town or area"
                    value={value}
                    onChangeText={(t) => onChange(sanitizePlace(t))}
                    onBlur={() => { onChange(normalizePlaceName(value)); onBlur(); }}
                    placeholder="e.g. Roysambu"
                    maxLength={50}
                    error={shownError(fieldState, value)}
                    autoCapitalize="words"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => streetRef.current?.focus()}
                />
            )}
        />
    );

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
                                label="Country"
                                title="Select a country"
                                value={value}
                                options={COUNTRY_OPTIONS}
                                error={error?.message}
                                onChange={(code) => {
                                    if (code !== value) {
                                        // a place from one country means nothing in another
                                        setValue("region", "");
                                        setValue("area", "");
                                        setValue("areaPlaceId", undefined);
                                        setValue("areaIsNew", false);
                                        setRegions([]);
                                        setPinWarning(null);
                                    }
                                    onChange(code);
                                }}
                            />
                        )}
                    />

                    {GAZETTEER_ENABLED ? (
                        <>
                            {areaField}
                            {/* the region only needs asking when the host added a place we don't know */}
                            {areaIsNew && regionField}
                        </>
                    ) : (
                        <>
                            {regionField}
                            {areaField}
                        </>
                    )}
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
                        render={({ field: { value, onChange, onBlur }, fieldState }) => (
                            <TextField
                                inputRef={streetRef}
                                label="Street, road or estate"
                                value={value}
                                onChangeText={(t) => onChange(sanitizeAddressLine(t))}
                                onBlur={() => { onChange(value.trim()); onBlur(); }}
                                placeholder="e.g. Off Thika Road, Mirema Drive"
                                maxLength={120}
                                error={shownError(fieldState, value)}
                                helper="Many places have no street number. A road or estate name is fine."
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
                        render={({ field: { value, onChange, onBlur }, fieldState }) => (
                            <TextField
                                inputRef={buildingRef}
                                label="Building name"
                                optional
                                value={value ?? ""}
                                onChangeText={(t) => onChange(sanitizeAddressLine(t))}
                                onBlur={() => { onChange((value ?? "").trim()); onBlur(); }}
                                maxLength={60}
                                error={shownError(fieldState, value)}
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
                        render={({ field: { value, onChange, onBlur }, fieldState }) => (
                            <TextField
                                inputRef={unitRef}
                                label="Unit, floor or block"
                                optional
                                value={value ?? ""}
                                onChangeText={(t) => onChange(sanitizeAddressLine(t))}
                                onBlur={() => { onChange((value ?? "").trim()); onBlur(); }}
                                placeholder="e.g. Block B, 3rd floor, Door 12"
                                maxLength={40}
                                error={shownError(fieldState, value)}
                                returnKeyType="next"
                                submitBehavior="submit"
                                onSubmitEditing={() => landmarkRef.current?.focus()}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="landmark"
                        render={({ field: { value, onChange, onBlur }, fieldState }) => (
                            <TextField
                                inputRef={landmarkRef}
                                label="Nearby landmark"
                                optional
                                value={value ?? ""}
                                onChangeText={(t) => onChange(sanitizeAddressLine(t))}
                                onBlur={() => { onChange((value ?? "").trim()); onBlur(); }}
                                placeholder="e.g. Opposite Naivas, next to the petrol station"
                                maxLength={80}
                                error={shownError(fieldState, value)}
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