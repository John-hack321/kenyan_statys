# Screen patterns (copy the shape, not the content)

Every snippet uses components and helpers that already exist in the repo. Style matches the code: 4-space indent, double quotes, plain-language comments that explain *why*. Check imports against the real files before pasting. Check Expo SDK 57 docs before using an Expo API.

## Contents
1. Wizard / choice page
2. Form page
3. Callout (reassurance)
4. Banner (warning / error)
5. Empty state
6. Status page
7. Feed card (target shape)
8. Search bar as a button
9. Decorative motion that respects reduced motion
10. Page checklist
11. Collapsing header (WhatsApp-style profile photo)

---

## 1. Wizard / choice page

Header block + one choice group. No footer: the layout owns Back/Next.

```tsx
import { ScrollView, View } from "react-native";
import AppText from "@/components/AppText";
import ChoiceCard from "@/components/ChoiceCard";
import { rs, rv } from "@/styles/responsive";

const ExamplePage = () => (
    <View className="flex-1 bg-white">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(16) }}>
            <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                <AppText variant="title">What will guests have access to?</AppText>
                <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                    Pick one. You can change this later.
                </AppText>
            </View>

            {/* radiogroup so a screen reader announces the cards as one choice */}
            <View accessibilityRole="radiogroup" style={{ paddingHorizontal: rs(20), paddingTop: rv(12), gap: rv(12) }}>
                {/* <ChoiceCard ... /> items */}
            </View>
        </ScrollView>
    </View>
);
export default ExamplePage;
```

Rules: one `title` per page; subtitle is one sentence; selected card has a constant-width border; the page owns no navigation.

## 2. Form page

Copy `hostLegalName.tsx` / `listingPrice.tsx` as the template. The skeleton:

```tsx
const { control, trigger } = useForm<MyForm>({
    resolver: zodResolver(mySchema),
    mode: "onTouched",                 // errors appear after the field is left
    defaultValues: { /* from the draft, read ONCE with useRef(store.getState().draft).current */ },
});
const values = useWatch({ control });
useEffect(() => { setDraft({ /* mirror values */ }); }, [/* values */, setDraft]);
useEffect(() => { /* re-trigger for already-filled fields when coming back */ }, [initial, trigger]);

<ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: rv(24) }}>
    {/* header block */}
    <View style={{ paddingHorizontal: rs(20), paddingTop: rv(8), gap: rv(16) }}>
        <Controller control={control} name="field" render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
                label="Label"
                value={value}
                onChangeText={(t) => onChange(sanitizeX(t))}   // bad characters never appear
                onBlur={() => { onChange(value.trim()); onBlur(); }}
                error={error?.message}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => nextRef.current?.focus()}
            />
        )} />
    </View>
</ScrollView>
```

The same zod schema must decide whether Next is enabled (`constants/ventureFlowSteps.tsx`). One source of truth.

## 3. Callout (reassurance)

```tsx
<View className="flex-row rounded-2xl bg-[#EEF5F0]" style={{ padding: rs(14), gap: rs(10) }}>
    <Ionicons name="lock-closed-outline" size={rm(18)} color={COLORS.green} />
    <AppText variant="small" className="text-gray-700" style={{ flex: 1 }}>
        This stays private. Guests see your venture name, never your legal name.
    </AppText>
</View>
```

One sentence, true statement only. Not for errors.

## 4. Banner (warning / error)

```tsx
<View className="flex-row items-center rounded-xl" style={{ backgroundColor: COLORS.warningSoft, padding: rs(12), gap: rs(8) }}>
    <Ionicons name="information-circle-outline" size={rm(18)} color={COLORS.warning} />
    <AppText variant="small" style={{ flex: 1, color: COLORS.warning }}>
        Phone sign-in is coming soon. Please continue with Google for now.
    </AppText>
</View>
```

Error variant: `COLORS.dangerSoft` + `COLORS.danger` + `alert-circle`. Always icon + words. Offer the fix in the same banner when there is one.

## 5. Empty state

```tsx
<View
    className="items-center justify-center rounded-2xl border border-dashed border-gray-300"
    style={{ padding: rs(24), gap: rv(8), minHeight: rv(220) }}
>
    <Ionicons name="business-outline" size={rm(36)} color={COLORS.faint} />
    <AppText variant="large" weight="semibold" className="text-center">Your listings will be here</AppText>
    <AppText variant="small" className="text-gray-500 text-center">You can edit, pause and add listings from this tab.</AppText>
    {/* optional: one SecondaryButton / TextButton action */}
</View>
```

`COLORS.faint` is allowed here because the icon is decorative and the words carry the meaning.

## 6. Status page

Use `VerificationScreen` + `StatusPanel` + `PrimaryButton`/`SecondaryButton`. One state at a time; the title says the state ("We're reviewing your ID"), the note says what happens next, the footer has the one useful action. Polling screens must time out into a visible "taking longer than usual" state (see `IDConfirmation.tsx`).

## 7. Feed card (target shape for `ListingCard`)

Current `listing_cards.tsx` is below the standard (see `DESIGN.md` 9 #6). Target:

```tsx
import { Image } from "expo-image";
import { describeListing } from "@/constants/listingTypes";
import { formatKes } from "@/constants/schemas/price";

<TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    accessibilityRole="button"
    accessibilityLabel={`${item.title}, ${item.area ?? item.region ?? ""}, KSh ${formatKes(item.price)} per night`}
    style={{ flex: 1 }}
>
    <View style={{ aspectRatio: 4 / 3, borderRadius: rm(16), overflow: "hidden", backgroundColor: COLORS.greenSoft }}>
        {item.coverUrl ? (
            <Image source={{ uri: item.coverUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={150} />
        ) : (
            <View className="items-center justify-center" style={{ flex: 1 }}>
                <Ionicons name="image-outline" size={rm(28)} color={COLORS.faint} />
            </View>
        )}
    </View>
    <View style={{ marginTop: rv(8), gap: rv(2) }}>
        <View className="flex-row items-center justify-between">
            <AppText variant="body" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>{item.area ?? item.region}</AppText>
            {item.rating !== null && (
                <View className="flex-row items-center" style={{ gap: rs(3) }}>
                    <Ionicons name="star" size={rm(12)} color={COLORS.star} />
                    <AppText variant="small">{item.rating.toFixed(1)}</AppText>
                </View>
            )}
        </View>
        <AppText variant="small" className="text-gray-500" numberOfLines={1}>{item.title}</AppText>
        <AppText variant="body" weight="semibold">KSh {formatKes(item.price)} <AppText variant="small" className="text-gray-500">night</AppText></AppText>
    </View>
</TouchableOpacity>
```

The heart is a separate, 44 dp+ touchable wrapped in `requireAuth`, positioned over the image; it must not sit inside the card's own touchable without its own role and label. Cover image comes first, text second; no gradient overlay needed on a plain card.

## 8. Search bar as a button

The home search field should be a tappable row that opens the search page, not a live text input:

```tsx
<TouchableOpacity
    onPress={() => router.push("/search" as Href)}
    activeOpacity={0.85}
    accessibilityRole="search"
    accessibilityLabel="Search for places to stay"
    className="flex-row items-center rounded-full border border-gray-300 bg-white"
    style={{ minHeight: rm(48), paddingHorizontal: rs(16), gap: rs(10) }}
>
    <Ionicons name="search" size={rm(18)} color={COLORS.ink} />
    <AppText variant="body" className="text-gray-500">Where do you want to stay?</AppText>
</TouchableOpacity>
```

(Roadmap item; verify `accessibilityRole="search"` is accepted in RN 0.86 types before using, else use `button`.)

## 9. Decorative motion that respects reduced motion

```tsx
import { useReducedMotion } from "react-native-reanimated";

const reduce = useReducedMotion();
if (reduce) return null;               // confetti is decoration: skip entirely
// For entering animations: <Animated.View entering={reduce ? undefined : FadeInDown.delay(150).duration(500)} />
```

**(unverified)** Confirm `useReducedMotion` and the `entering` behaviour against the Reanimated 4.5 docs.

## 10. Page checklist (30 seconds before you hand it over)

- [ ] Uses existing components; nothing new unless listed in `DESIGN.md` 3.
- [ ] `AppText` only; sizes via `rs/rv/rm`; colours via `COLORS`.
- [ ] One primary action; title + one-sentence subtitle.
- [ ] Targets 44+ effective; roles, labels, states set.
- [ ] Loading / empty / error / success handled.
- [ ] Keyboard behaviour right; scroll has bottom padding where the tab bar floats.
- [ ] Survives font scale 1.2 and a 360 dp wide screen.
- [ ] Copy is plain, sentence case, no emoji, no unbuilt promises.
- [ ] You said what you did not run.

## 11. Collapsing header (WhatsApp-style profile photo)

Big centred avatar at the top; as the user scrolls, it shrinks and slides to the top left, ending beside the name in a slim bar; scrolling back restores it. Scroll-linked, so it follows the finger and runs on the UI thread. Good fit for the Profile tab and, later, the venture page.

```tsx
import Animated, {
    Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue,
} from "react-native-reanimated";

const HERO = rm(120);       // avatar size at the top
const SMALL = rm(36);       // avatar size when collapsed
const RANGE = rv(140);      // how far to scroll before fully collapsed

const { width } = useWindowDimensions();
const scrollY = useSharedValue(0);
const onScroll = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });

const avatarStyle = useAnimatedStyle(() => {
    const t = interpolate(scrollY.value, [0, RANGE], [0, 1], Extrapolation.CLAMP);
    return {
        transform: [
            { translateX: interpolate(t, [0, 1], [0, -(width / 2) + rs(20) + SMALL / 2]) },   // centre to left gutter
            { translateY: interpolate(t, [0, 1], [0, -rv(70)]) },                              // up into the bar
            { scale: interpolate(t, [0, 1], [1, SMALL / HERO]) },
        ],
    };
});

// <Animated.View style={[styles.avatar, avatarStyle]} />  (absolutely positioned above the scroll content)
// <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: HERO + rv(40) }} />
```

Rules: animate only `transform` and `opacity`; clamp the range; keep the name visible and the whole bar a real header (back/close targets stay 44 dp+); the avatar needs an `accessibilityLabel`; for reduce-motion users use `useReducedMotion()` and let the avatar snap instead of animating. **(unverified)** The numbers are a starting point and the API names must be checked against the Reanimated 4.5 docs; tune on a small Android phone.