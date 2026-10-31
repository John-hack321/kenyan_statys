import { ReactNode } from "react";
import { Redirect } from "expo-router";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { useAppMode } from "@/lib/hooks/useAppMode";

// Wrap every host screen in this. A non-host who somehow lands on a host screen (deep link, old state, bug) is sent home.
// THIS IS NOT SECURITY, only a better experience than an empty broken screen: the database (RLS) is what really
// protects host data, so every query behind a host screen must be blocked for non-hosts on its own.
export default function HostOnly({ children }: { children: ReactNode }) {
    const { isLoading } = useAuthContext();
    const { isHost } = useAppMode();

    if (isLoading) return null;           // wait until we know who is signed in
    if (!isHost) return <Redirect href="/" />;
    return <>{children}</>;
}