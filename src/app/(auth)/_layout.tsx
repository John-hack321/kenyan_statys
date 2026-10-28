import { Slot } from "expo-router";
import { useEffect } from "react";
import ModalSheet, { useModalSheet } from "@/components/ModalSheet";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { clearPendingAction, takePendingAction } from "@/lib/pending-actions";

function AuthGate() {
    const { isLoggedIn, isLoading } = useAuthContext();
    const { close } = useModalSheet();

    // Login succeeded: slide down, THEN run what the user was trying to do (like, message host, publish...)
    useEffect(() => {
        if (isLoading || !isLoggedIn) return;
        close(takePendingAction() ?? undefined);
    }, [isLoading, isLoggedIn, close]);

    return <Slot />;
}

export default function AuthLayout() {
    return (
        // closed without logging in: forget the action so it can't fire at some later login
        <ModalSheet onClosed={clearPendingAction}>
            <AuthGate />
        </ModalSheet>
    );
}