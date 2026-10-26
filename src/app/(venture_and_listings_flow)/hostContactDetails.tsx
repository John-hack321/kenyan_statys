import { useEffect, useRef } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import PhoneField from "@/components/PhoneField";
import TextField from "@/components/TextField";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { DEFAULT_COUNTRY_CODE } from "@/constants/africaCountries";
import { ContactForm, cleanPhoneDigits, contactSchema } from "@/constants/schemas/venture";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { rm, rs, rv } from "@/styles/responsive";

// Nothing is verified here. Both are verified after the host has an account (see the host-setup page).
const HostContactDetailsPage = () => {
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const emailRef = useRef<TextInput>(null);
    const { session } = useAuthContext();

    // read once: react-hook-form owns the values while the page is open, the draft is just where we save them
    const initial = useRef(useVentureDraftStore.getState().draft).current;

    const { control, trigger, setValue } = useForm<ContactForm>({
        resolver: zodResolver(contactSchema),
        mode: "onTouched",
        defaultValues: {
            // the listing's country is the best guess for the phone's country code
            phoneCountry: initial.contactPhone?.country ?? initial.address?.country ?? DEFAULT_COUNTRY_CODE,
            phone: initial.contactPhone?.number ?? "",
            // already signed in (for example with Google)? Their account email is the obvious answer
            email: initial.contactEmail ?? session?.user?.email ?? "",
        },
    });

    const values = useWatch({ control });
    useEffect(() => {
        setDraft({
            contactPhone: { country: values.phoneCountry ?? DEFAULT_COUNTRY_CODE, number: values.phone ?? "" },
            contactEmail: values.email ?? "",
        });
    }, [values.phoneCountry, values.phone, values.email, setDraft]);

    // coming back to a half-filled page: show the errors for what is already typed
    useEffect(() => {
        if (initial.contactPhone?.number) trigger("phone");
        if (initial.contactEmail) trigger("email");
    }, [initial, trigger]);

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingBottom: rv(24) }}
            >
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">How can we reach you?</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        For booking updates and to keep your account safe.
                    </AppText>
                </View>

                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(8), gap: rv(16) }}>
                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <PhoneField
                                label="Phone number"
                                countryCode={values.phoneCountry ?? DEFAULT_COUNTRY_CODE}
                                onCountryChange={(iso) => setValue("phoneCountry", iso, { shouldDirty: true, shouldValidate: !!value })}
                                value={value}
                                onChangeText={(t) => onChange(cleanPhoneDigits(t))}
                                onBlur={onBlur}
                                error={error?.message}
                                helper="Type it the way you normally would, with or without the 0."
                                onSubmitEditing={() => emailRef.current?.focus()}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                inputRef={emailRef}
                                label="Email"
                                value={value}
                                onChangeText={onChange}
                                onBlur={() => { onChange(value.trim()); onBlur(); }}
                                placeholder="you@example.com"
                                maxLength={120}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                error={error?.message}
                                returnKeyType="done"
                            />
                        )}
                    />

                    <View className="flex-row rounded-2xl bg-[#EEF5F0]" style={{ padding: rs(14), gap: rs(10) }}>
                        <Ionicons name="shield-checkmark-outline" size={rm(18)} color="#064D30" />
                        <AppText variant="small" className="text-gray-700" style={{ flex: 1 }}>
                            Next you'll create your account. We'll then confirm your email and send a code to your phone.
                        </AppText>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default HostContactDetailsPage;
