import { useEffect, useRef } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import SuggestionChip from "@/components/SuggestionChip";
import TextField from "@/components/TextField";
import VentureCardPreview from "@/components/VentureCardPreview";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { randomVentureName, suggestVentureNames } from "@/constants/ventureNames";

import { 
    VENTURE_NAME_MAX,
    VentureNameForm,
    sanitizeVentureName,    
    ventureNameFormSchema,
 } from "@/constants/schemas/venture";

import { rm, rs, rv } from "@/styles/responsive";

const GREEN = "#064D30";

const VentureNamePage = () => {
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const firstName = useVentureDraftStore((s) => s.draft.legalFirstName);
    const lastName = useVentureDraftStore((s) => s.draft.legalLastName);
    const coverUri = useVentureDraftStore((s) => s.draft.ventureCover?.uri);

    // read once: react-hook-form owns the value while the page is open, the draft is just where we save it
    const initial = useRef(useVentureDraftStore.getState().draft).current;

    const { control, setValue, trigger } = useForm<VentureNameForm>({
        resolver: zodResolver(ventureNameFormSchema),
        mode: "onTouched",
        defaultValues: { ventureName: initial.ventureName ?? "" },
    });

    const values = useWatch({ control });
    const name = values.ventureName ?? "";
    useEffect(() => { setDraft({ ventureName: name }); }, [name, setDraft]);

    useEffect(() => { if (initial.ventureName) trigger("ventureName"); }, [initial, trigger]);

    const suggestions = suggestVentureNames(firstName, lastName);
    const fill = (value: string) => setValue("ventureName", value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingBottom: rv(24) }}
            >
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Name your venture</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Guests see this on all your listings. Pick an idea, or write your own. You can change it later.
                    </AppText>
                </View>

                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(8), gap: rv(14) }}>
                    <Controller
                        control={control}
                        name="ventureName"
                        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                            <TextField
                                label="Venture name"
                                value={value}
                                onChangeText={(t) => onChange(sanitizeVentureName(t))}
                                onBlur={() => { onChange(value.trim()); onBlur(); }}
                                placeholder="e.g. Bespoke Homes"
                                maxLength={VENTURE_NAME_MAX}
                                showCounter
                                error={error?.message}
                                autoCapitalize="words"
                                returnKeyType="done"
                            />
                        )}
                    />

                    <View>
                        <AppText variant="caption" weight="medium" className="text-gray-500" style={{ marginBottom: rv(8) }}>
                            IDEAS
                        </AppText>
                        <View className="flex-row flex-wrap" style={{ gap: rs(8) }}>
                            {suggestions.map((s) => (
                                <SuggestionChip key={s} label={s} selected={name.trim() === s} onPress={() => fill(s)} />
                            ))}
                            <SuggestionChip label="Surprise me" icon="dice-outline" onPress={() => fill(randomVentureName(name.trim()))} />
                        </View>
                    </View>

                    <View style={{ marginTop: rv(6) }}>
                        <AppText variant="caption" weight="medium" className="text-gray-500" style={{ marginBottom: rv(8) }}>
                            HOW GUESTS WILL SEE IT
                        </AppText>
                        <VentureCardPreview name={name} coverUri={coverUri} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default VentureNamePage;
