import { Ref, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import TextField from "@/components/TextField";
import { PlaceResult, searchPlaces } from "@/lib/places";
import { rm, rs, rv } from "@/styles/responsive";

const GREEN = "#064D30";

type Props = {
    label: string;
    value: string;
    country: string;                     // ISO code, e.g. "KE": we only suggest places from this country
    chosen: boolean;                     // true once a suggestion was picked, or "add as new" was tapped
    error?: string;
    helper?: string;
    inputRef?: Ref<TextInput>;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    onPick: (place: PlaceResult) => void;
    onAddNew: (name: string) => void;
    onSubmitEditing?: () => void;
};

// A text field that suggests places from our own table as you type (typo tolerant).
// The host must PICK one, or deliberately add a new one, so the same place is never spelled two ways.
export default function PlaceSearchField({
    label, value, country, chosen, error, helper, inputRef, onChangeText, onBlur, onPick, onAddNew, onSubmitEditing,
}: Props) {
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const requestId = useRef(0);
    const query = value.trim();

    useEffect(() => {
        const id = ++requestId.current;                       // every change starts a new "latest request"
        if (chosen || query.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const timer = setTimeout(async () => {                // wait until they pause typing
            try {
                const found = await searchPlaces(query, country);
                if (id !== requestId.current) return;         // an older search finished late: ignore it
                setResults(found);
                setFailed(false);
            } catch {
                if (id === requestId.current) { setResults([]); setFailed(true); }
            } finally {
                if (id === requestId.current) setLoading(false);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [query, country, chosen]);

    const pick = (place: PlaceResult) => {
        Keyboard.dismiss();
        onPick(place);
    };

    const addNew = () => {
        const best = results[0];
        // something very similar already exists: ask before creating a near-duplicate
        if (best && best.score >= 0.5) {
            Alert.alert(`Did you mean ${best.name}?`, best.admin1 ? `${best.name}, ${best.admin1}` : undefined, [
                { text: `Use ${best.name}`, onPress: () => pick(best) },
                { text: "Add mine anyway", onPress: () => { Keyboard.dismiss(); onAddNew(query); } },
                { text: "Cancel", style: "cancel" },
            ]);
            return;
        }
        Keyboard.dismiss();
        onAddNew(query);
    };

    const showList = !chosen && query.length >= 2;
    const exactMatch = results.some((r) => r.name.toLowerCase() === query.toLowerCase());

    return (
        <View>
            <TextField
                inputRef={inputRef}
                label={label}
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                placeholder="Start typing, e.g. Roysambu"
                maxLength={50}
                error={error}
                helper={helper}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={onSubmitEditing}
            />

            {showList && (
                <View
                    style={{
                        marginTop: rv(8),
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: rm(12),
                        backgroundColor: "white",
                        overflow: "hidden",
                    }}
                >
                    {loading && results.length === 0 && (
                        <View className="flex-row items-center" style={{ padding: rs(14), gap: rs(8) }}>
                            <ActivityIndicator size="small" color={GREEN} />
                            <AppText variant="small" className="text-gray-500">Searching…</AppText>
                        </View>
                    )}

                    {results.map((r) => (
                        <TouchableOpacity
                            key={r.id}
                            onPress={() => pick(r)}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={`${r.name}${r.admin1 ? `, ${r.admin1}` : ""}`}
                            className="flex-row items-center border-b border-gray-100"
                            style={{ minHeight: rm(48), paddingHorizontal: rs(14), paddingVertical: rv(8), gap: rs(10) }}
                        >
                            <Ionicons name="location-outline" size={rm(18)} color={GREEN} />
                            <View style={{ flex: 1 }}>
                                <AppText variant="body" weight="medium">{r.name}</AppText>
                                {!!r.admin1 && r.admin1 !== r.name && (
                                    <AppText variant="caption" className="text-gray-500">{r.admin1}</AppText>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {failed && (
                        <AppText variant="caption" className="text-gray-500" style={{ padding: rs(14) }}>
                            Can't search places right now. You can still add it below.
                        </AppText>
                    )}

                    {!exactMatch && !(loading && results.length === 0) && (
                        <TouchableOpacity
                            onPress={addNew}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            className="flex-row items-center"
                            style={{ minHeight: rm(48), paddingHorizontal: rs(14), paddingVertical: rv(8), gap: rs(10) }}
                        >
                            <Ionicons name="add-circle-outline" size={rm(18)} color={GREEN} />
                            <AppText variant="body" weight="medium" className="text-dark-green-ascents" style={{ flex: 1 }}>
                                {`Add "${query}" as a new area`}
                            </AppText>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}