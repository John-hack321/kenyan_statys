// src/app/(verification_flow)/_layout.tsx   (NEW FILE)
//
// The verification pages (contact confirmation, ID check) live in their own route group so the GUEST
// verification can reuse them later. Each page draws its own header with <VerificationScreen>, so the
// native header stays off. Because it is a Stack, the back button returns to /host-setup.

import { Stack } from "expo-router";

export default function VerificationFlowLayout() {
    return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "white" } }} />;
}