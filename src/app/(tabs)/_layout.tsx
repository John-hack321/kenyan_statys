import { useEffect } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Href, Tabs, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppMode } from "@/lib/hooks/useAppMode";
import { COLORS } from "@/styles/colors";

const TAB_HEIGHT = 68;
const HOST_HOME = "/host-dashboard";

type TabBarIconProps = {
    focused: boolean;
    iconName: keyof typeof Ionicons.glyphMap;
    title: string;
};

// Icon on top, label under it, the whole group centred. No flex-1: that is what pushed it up.
const TabBarIcon = ({ focused, iconName, title }: TabBarIconProps) => (
    <View style={{ width: 72, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={iconName} size={24} color={focused ? COLORS.green : "#5D5F6D"} />
        <Text
            numberOfLines={1}
            style={{ marginTop: 2, fontSize: 12, fontWeight: "700", color: focused ? COLORS.green : "#5D5F6D" }}
        >
            {title}
        </Text>
    </View>
);

// A tab that is not part of the current mode. Expo Router turns EVERY file in this folder into a tab,
// so a tab is hidden with href: null, not by leaving its <Tabs.Screen> out.
const HIDDEN = { href: null } as const;

// ONE tab navigator for everybody. The tabs shown depend on the mode (see HOST_GUEST_PLAN.md):
//   guest mode: Home, Profile        host mode: Hosting, Listings, Bookings, Profile
// This is only about what is SHOWN. The database decides what anyone may do.
export default function TabsLayout() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();
    const { isHostMode } = useAppMode();

    // Safety net: if the current screen does not belong to the mode (deep link, "Back to home" button,
    // sign-out, mode switch), go to the mode's start screen instead of showing a hidden tab.
    useEffect(() => {
        const onHostScreen = pathname.startsWith("/host-");
        if (!isHostMode && onHostScreen) router.replace("/" as Href);
        else if (isHostMode && pathname === "/") router.replace(HOST_HOME as Href);
    }, [isHostMode, pathname, router]);

    const guestTab = (iconName: keyof typeof Ionicons.glyphMap, title: string) =>
        isHostMode ? HIDDEN : { tabBarIcon: ({ focused }: { focused: boolean }) => <TabBarIcon focused={focused} iconName={iconName} title={title} /> };
    const hostTab = (iconName: keyof typeof Ionicons.glyphMap, title: string) =>
        isHostMode ? { tabBarIcon: ({ focused }: { focused: boolean }) => <TabBarIcon focused={focused} iconName={iconName} title={title} /> } : HIDDEN;

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <StatusBar style="dark" />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    sceneStyle: { backgroundColor: "white" },
                    tabBarStyle: {
                        position: "absolute",
                        left: 20,
                        marginLeft: 20,
                        marginRight: 20,
                        right: 20,
                        bottom: insets.bottom + 12,   // floats above the gesture bar / curved corners
                        height: TAB_HEIGHT,
                        borderRadius: TAB_HEIGHT / 2,
                        borderTopWidth: 0,
                        backgroundColor: "white",
                        paddingTop: 12,
                        paddingBottom: 0,             // kills the default safe-area padding
                        paddingHorizontal: 8,
                        shadowColor: "#1a1a1a",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 6,
                    },
                    tabBarItemStyle: {
                        height: TAB_HEIGHT,
                        paddingVertical: 0,
                        justifyContent: "center",
                        alignItems: "center",
                    },
                }}
            >
                {/* guest mode */}
                <Tabs.Screen name="index" options={guestTab("home", "Home")} />

                {/* host mode */}
                <Tabs.Screen name="host-dashboard" options={hostTab("grid", "Hosting")} />
                <Tabs.Screen name="host-listings" options={hostTab("business", "Listings")} /> {/* all three of these pages are just place holder till I code the pages well myself  .  */}
                <Tabs.Screen name="host-bookings" options={hostTab("calendar", "Bookings")} />

                {/* both modes */}
                <Tabs.Screen
                    name="profile"
                    options={{ tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} iconName="person" title="Profile" /> }}
                />
            </Tabs>
        </View>
    );
}
