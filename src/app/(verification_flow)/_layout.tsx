// src/app/(verification_flow)/_layout.tsx   (NEW FILE)
//
// The verification pages (ID check, and later the guest verification) live in their own route group.
// NOTE: the phone / email code page is NOT here any more. It is a bottom sheet, so it is a top-level route
// (src/app/contactConfirmation.tsx) registered as a transparentModal in the root _layout. Each page draws its own header with <VerificationScreen>, so the
// native header stays off. Because it is a Stack, the back button returns to /host-setup.

import { Stack } from "expo-router";

export default function VerificationFlowLayout() {
    return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "white" } }} />;
}