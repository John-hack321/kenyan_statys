import { useEffect, useRef } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import TextField from "@/components/TextField";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { LegalNameForm, legalNameSchema, sanitizePersonName } from "@/constants/schemas/venture";
import { rm, rs, rv } from "@/styles/responsive";

// Asked BEFORE the venture name, so the name page can suggest "<First name>'s Stays".
const HostLegalNamePage = () => {
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const lastRef = useRef<TextInput>(null);

    // read once: react-hook-form owns the values while the page is open, the draft is just where we save them
    const initial = useRef(useVentureDraftStore.getState().draft).current;

    const { control, trigger } = useForm<LegalNameForm>({
        resolver: zodResolver(legalNameSchema),
        mode: "onTouched",
        defaultValues: { legalFirstName: initial.legalFirstName ?? "", legalLastName: initial.legalLastName ?? "" },
    });

    const values = useWatch({ control });
    useEffect(() => {
        setDraft({ legalFirstName: values.legalFirstName ?? "", legalLastName: values.legalLastName ?? "" });
    }, [values.legalFirstName, values.legalLastName, setDraft]);

    // coming back to a half-filled page: show the errors for what is already typed
    useEffect(() => {
        if (initial.legalFirstName) trigger("legalFirstName");
        if (initial.legalLastName) trigger("legalLastName");
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
                    <AppText variant="title">First, who are we talking to?</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Use your name exactly as it appears on your ID.
                    </AppText>
                </View>

                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(8), gap: rv(16) }}>
                    <Controller
                        control={control}
                        name="legalFirstName"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                label="First name(s)"
                                value={value}
                                onChangeText={(t) => onChange(sanitizePersonName(t))}
                                onBlur={() => { onChange(value.trim()); onBlur(); }}
                                placeholder="e.g. Wanjiru"
                                maxLength={40}
                                error={error?.message}
                                autoCapitalize="words"
                                autoComplete="given-name"
                                returnKeyType="next"
                                submitBehavior="submit"
                                onSubmitEditing={() => lastRef.current?.focus()}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="legalLastName"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                inputRef={lastRef}
                                label="Last name"
                                value={value}
                                onChangeText={(t) => onChange(sanitizePersonName(t))}
                                onBlur={() => { onChange(value.trim()); onBlur(); }}
                                placeholder="e.g. Kamau"
                                maxLength={40}
                                error={error?.message}
                                autoCapitalize="words"
                                autoComplete="family-name"
                                returnKeyType="done"
                            />
                        )}
                    />

                    <View className="flex-row rounded-2xl bg-[#EEF5F0]" style={{ padding: rs(14), gap: rs(10) }}>
                        <Ionicons name="lock-closed-outline" size={rm(18)} color="#064D30" />
                        <AppText variant="small" className="text-gray-700" style={{ flex: 1 }}>
                            This stays private. Guests see your venture name, never your legal name.
                        </AppText>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default HostLegalNamePage;
