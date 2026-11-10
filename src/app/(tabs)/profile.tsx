import { ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from '@/app_state/user_store';
import { signOut } from "@/lib/aut-actions";
import { useAuthContext } from '../../../lib/hooks/auth-context';
import { useAppMode } from "@/lib/hooks/useAppMode";
import AppText from "@/components/AppText";
import TextButton from "@/components/TextButton";
import FinishSetupCard from "@/components/host/FinishSetupCard";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

const Profile = () => {
    const insets = useSafeAreaInsets();
    const user = useUserStore((state) => state.user);
    const devForceHost = useUserStore((s) => s.devForceHost);
    const setDevForceHost = useUserStore((s) => s.setDevForceHost);
    const { isHost, isHostMode, setMode } = useAppMode();
    const { isLoggedIn, isLoading } = useAuthContext();
    const router = useRouter();

    if (isLoading) return null;

    // first time hosts see the welcome page; hosts who already have a venture go straight to the listing questions
    const handleBecomeAHostButtonPress = () => router.push("/welcomePage");
    const handleAddListingPress = () => router.push("/listingTypeChoice");

    // Switching sides: change the mode, then go to that side's start screen (the tabs layout also guards this)
    const switchTo = (next: "host" | "guest") => {
        setMode(next);
        router.replace((next === "host" ? "/host-dashboard" : "/") as Href);
    };

    // Guest view: the tab is still reachable, it just asks them to sign in.
    if (!isLoggedIn) {
        return (
            <View className="flex-1 bg-white px-6 items-center justify-center">
                {/* Icon */}
                <View className="h-20 w-20 rounded-full bg-gray-100 items-center justify-center mb-6">
                    <Ionicons name="person-outline" size={36} color="#111" />
                </View>

                {/* Text */}
                <AppText variant="heading" className="text-center" style={{ marginBottom: rv(8) }}>
                    You're browsing as a guest
                </AppText>
                <AppText variant="body" className="text-gray-500 text-center" style={{ marginBottom: rv(32), maxWidth: 300 }}>
                    Sign in to see your profile, save listings and message owners.
                </AppText>

                {/* Primary action */}
                <TouchableOpacity
                    onPress={() => router.push('/sign-in')}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    className="bg-dark-green-ascents rounded-xl w-full max-w-[360px] items-center justify-center"
                    style={{ minHeight: rm(52) }}
                >
                    <AppText variant="large" weight="bold" className="text-white">Sign in</AppText>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center w-full max-w-[360px] my-6">
                    <View className="flex-1 h-px bg-gray-200" />
                    <AppText variant="caption" className="mx-3 text-gray-400">Have a place to list?</AppText>
                    <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Secondary action */}
                <TextButton
                    onPress={handleBecomeAHostButtonPress}
                    buttonName="Become a host"
                    textClassName="font-bold text-base"
                    className="w-full max-w-[360px] border border-black rounded-xl py-4 items-center" />
            </View>
        );
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: insets.top + rv(16), paddingHorizontal: rs(20), paddingBottom: 160, gap: rv(16) }}
        >
            <AppText variant="heading">Profile</AppText>

            <View className="flex-row items-center" style={{ gap: rs(12) }}>
                {user?.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={{ width: 56, height: 56, borderRadius: 28 }} />
                ) : null}
                <View style={{ flex: 1 }}>
                    <AppText variant="large" weight="semibold">{user?.fullName ?? "No name yet"}</AppText>
                    <AppText variant="small" className="text-gray-600">{user?.email}</AppText>
                </View>
            </View>

            {/* hosts who still have to verify: the card opens the checklist (does nothing for verified hosts and guests) */}
            <FinishSetupCard />

            {/* a host can look at the app from either side */}
            {isHost && (
                <TouchableOpacity
                    onPress={() => switchTo(isHostMode ? "guest" : "host")}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    className="flex-row items-center rounded-2xl border border-gray-300 bg-white"
                    style={{ padding: rs(14), gap: rs(12) }}
                >
                    <Ionicons name="swap-horizontal-outline" size={rm(22)} color={COLORS.green} />
                    <AppText variant="body" weight="semibold" style={{ flex: 1 }}>
                        {isHostMode ? "Switch to traveling" : "Switch to hosting"}
                    </AppText>
                    <Ionicons name="chevron-forward" size={rm(18)} color={COLORS.muted} />
                </TouchableOpacity>
            )}

            {/* signed in: hosts add another listing, everyone else can become a host */}
            <TextButton
                onPress={isHost ? handleAddListingPress : handleBecomeAHostButtonPress}
                buttonName={isHost ? "Add a new listing" : "Become a host"}
                textClassName="font-bold text-base"
                className="w-full border border-black rounded-xl py-4 items-center" />

            {/* DEV ONLY (not in release builds): act like a host so the host side can be built before publishing works.
                It only changes what the UI shows. Data and publishing still use the real account. */}
            {__DEV__ && (
                <View className="flex-row items-center rounded-2xl border border-dashed border-gray-400" style={{ padding: rs(14), gap: rs(12) }}>
                    <View style={{ flex: 1 }}>
                        <AppText variant="small" weight="semibold">Dev: act like a host</AppText>
                        <AppText variant="caption" className="text-gray-500">UI only. Turn on, then tap "Switch to hosting".</AppText>
                    </View>
                    <Switch value={devForceHost} onValueChange={setDevForceHost} trackColor={{ true: COLORS.green }} />
                </View>
            )}

            <TouchableOpacity
                onPress={signOut}
                activeOpacity={0.8}
                accessibilityRole="button"
                className="items-center justify-center rounded-xl border border-gray-300"
                style={{ marginTop: rv(8), minHeight: rm(48) }}
            >
                <AppText variant="large" weight="semibold">Sign out</AppText>
            </TouchableOpacity>
        </ScrollView>
    )
}

export default Profile;