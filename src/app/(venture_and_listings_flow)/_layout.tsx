import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, usePathname, useRouter } from "expo-router";
import { Alert, Image, ImageBackground, useWindowDimensions, View } from "react-native";
import { images } from "@/constants/images";
import AppText from "@/components/AppText";
import PublishingOverlay from "@/components/PublishingOverlay";
import {
    BackButton,
    DiscardButton,
    FlowProgressBar,
    NextPageButton,
    SaveAndExitButton,
} from "@/components/ventureFlowButtons";
import { useVentureFlow } from "@/lib/hooks/useVentureFlow";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { rs, rv } from "@/styles/responsive";

export default function VentureCreationLayout() {
    const router = useRouter();
    const pathName = usePathname();
    const { height } = useWindowDimensions();
    const isWelcomePage = pathName.endsWith("/welcomePage");

    const flow = useVentureFlow();
    const resetDraft = useVentureDraftStore((s) => s.resetDraft);

    // the draft is saved on the phone as you type, so "save & exit" only has to leave
    const handleSaveAndExit = () => router.replace("/");

    const handleDiscard = () =>
        Alert.alert("Discard this listing?", "Everything you entered so far will be deleted.", [
            { text: "Keep editing", style: "cancel" },
            {
                text: "Discard",
                style: "destructive",
                onPress: () => {
                    resetDraft(); // also deletes the kept photo files
                    router.replace("/");
                },
            },
        ]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/** the big image only applies to the welcome page */}
            {isWelcomePage && (
                <View className="relative w-full" style={{ height: Math.min(height * 0.4, rv(340)) }}>
                    <ImageBackground source={images.appartmentImage} resizeMode="cover" className="size-full" />
                    <Image source={images.cardGradient} className="w-full h-2/3 absolute bottom-0" />
                    <View className="absolute bottom-0 left-0 right-0" style={{ paddingHorizontal: rs(24), paddingBottom: rv(24) }}>
                        <AppText variant="heading" className="text-white">
                            Ready to start listing your apartments?
                        </AppText>
                    </View>
                </View>
            )}

            {!isWelcomePage && (
                <View>
                    <View className="flex-row items-center justify-between" style={{ paddingHorizontal: rs(20), paddingVertical: rv(10) }}>
                        <SaveAndExitButton onPress={handleSaveAndExit} />
                        <DiscardButton onPress={handleDiscard} />
                    </View>
                    <FlowProgressBar progress={flow.progress} />
                </View>
            )}

            <View className="flex-1">
                <Slot />
            </View>

            {!isWelcomePage && (
                <View
                    className="flex-row items-center justify-between border-t border-gray-200 bg-white"
                    style={{ paddingHorizontal: rs(20), paddingVertical: rv(10) }}
                >
                    <BackButton onPress={flow.goBack} disabled={flow.isPublishing} />
                    <NextPageButton
                        clickable={flow.canProceed}
                        loading={flow.isPublishing}
                        onPress={flow.goNext}
                        label={flow.nextLabel}
                    />
                </View>
            )}

            {/* covers the screen while publishing: a real progress bar that follows the photo uploads */}
            <PublishingOverlay
                visible={flow.isPublishing}
                progress={flow.publishProgress.value}
                label={flow.publishProgress.label}
            />
        </SafeAreaView>
    );
}