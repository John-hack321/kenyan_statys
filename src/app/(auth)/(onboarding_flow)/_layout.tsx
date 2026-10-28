import { Slot } from "expo-router";

// The ModalSheet in (auth)/_layout.tsx already provides the sheet, safe areas and keyboard handling.
export default function OnboardingLayout() {
    return <Slot />;
}