import { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";
import { useVentureDraftStore, type IdType } from "@/app_state/ventureFlowStore";
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY_CODE } from "@/constants/africaCountries";
import { ID_TYPES, IdForm, idSchema, sanitizeIdNumber } from "@/constants/schemas/venture";
import { rm, rs, rv } from "@/styles/responsive";

const GREEN = "#064D30";

const ID_TYPE_OPTIONS = ID_TYPES.map((t) => ({ value: t.value, label: t.label }));
const NUMBER_LABEL: Record<IdType, string> = {
    national_id: "ID number",
    passport: "Passport number",
    resident_id: "Resident ID number",
};

// Collects the ID number. NOTHING is checked on this page: the check happens after the host has an account.
// The number is kept in memory only (see `partialize` in ventureFlowStore.ts), never written to the phone's storage.
const HostIdNumberPage = () => {
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const initial = useRef(useVentureDraftStore.getState().draft).current;

    const { control, setValue, trigger } = useForm<IdForm>({
        resolver: zodResolver(idSchema),
        mode: "onTouched",
        defaultValues: {
            // the country of the listing is the best guess for where the host's ID is from
            idCountry: initial.idCountry ?? initial.address?.country ?? DEFAULT_COUNTRY_CODE,
            // most hosts use a national ID, so it is preselected. It is only a type, and it is easy to change.
            idType: initial.idType ?? "national_id",
            idNumber: initial.idNumber ?? "",
        },
    });

    const values = useWatch({ control });
    const idType = (values.idType ?? "national_id") as IdType;
    const isNumericId = values.idCountry === "KE" && idType === "national_id";

    useEffect(() => {
        setDraft({ idCountry: values.idCountry, idType: values.idType as IdType | undefined, idNumber: values.idNumber ?? "" });
    }, [values.idCountry, values.idType, values.idNumber, setDraft]);

    // switching country or type changes what a valid number looks like: check the number again
    useEffect(() => {
        if (values.idNumber) trigger("idNumber");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.idCountry, values.idType]);

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingBottom: rv(24) }}
            >
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Let's confirm it's really you</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Hosts look after guests' money and homes, so we check every host once.
                    </AppText>
                </View>

                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(8), gap: rv(14) }}>
                    <Controller
                        control={control}
                        name="idCountry"
                        render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <SelectField
                                label="Country that issued your ID"
                                title="Select a country"
                                value={value}
                                options={COUNTRY_OPTIONS}
                                error={error?.message}
                                onChange={onChange}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="idType"
                        render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <SelectField
                                label="Type of ID"
                                title="Type of ID"
                                value={value}
                                options={ID_TYPE_OPTIONS}
                                error={error?.message}
                                onChange={onChange}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="idNumber"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                label={NUMBER_LABEL[idType]}
                                value={value}
                                onChangeText={(t) => onChange(sanitizeIdNumber(t))}
                                onBlur={() => { onChange(value.trim()); onBlur(); }}
                                maxLength={20}
                                keyboardType={isNumericId ? "number-pad" : "default"}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                autoComplete="off"
                                error={error?.message}
                                helper="We'll check it after you create your account."
                                returnKeyType="done"
                            />
                        )}
                    />

                    <View className="rounded-2xl bg-[#EEF5F0]" style={{ padding: rs(14), gap: rv(8) }}>
                        {[
                            { icon: "eye-off-outline" as const, text: "Guests never see your ID." },
                            { icon: "phone-portrait-outline" as const, text: "It isn't saved on your phone. If you close the app before you finish, you'll type it again." },
                            { icon: "camera-outline" as const, text: "We may also ask for a quick selfie to make sure the ID is yours." },
                        ].map((row) => (
                            <View key={row.text} className="flex-row" style={{ gap: rs(10) }}>
                                <Ionicons name={row.icon} size={rm(18)} color={GREEN} />
                                <AppText variant="small" className="text-gray-700" style={{ flex: 1 }}>{row.text}</AppText>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default HostIdNumberPage;
