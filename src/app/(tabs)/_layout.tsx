import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/styles/colors";

const TAB_HEIGHT = 68;

type TabBarIconProps = {
    focused: boolean;
    iconName: keyof typeof Ionicons.glyphMap;
    title: string;
};

// Icon on top, label under it, the whole group centred. No flex-1: that is what pushed it up.
const TabBarIcon = ({ focused, iconName, title }: TabBarIconProps) => (
    <View style={{  width: 72, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={iconName} size={24} color={focused ? COLORS.green : "#5D5F6D"} />
        <Text
            numberOfLines={1}
            style={{ marginTop: 2, fontSize: 12, fontWeight: "700", color: focused ? COLORS.green : "#5D5F6D" }}
        >
            {title}
        </Text>
    </View>
);

export default function TabsLayout() {
    const insets = useSafeAreaInsets();

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
                        bottom: insets.bottom + 12, // floats above the gesture bar / curved corners
                        height: TAB_HEIGHT,
                        borderRadius: TAB_HEIGHT / 2,
                        borderTopWidth: 0,
                        backgroundColor: "white",
                        paddingTop: 0,
                        paddingBottom: 0, // kills the default safe-area padding
                        paddingHorizontal: 8,
                        shadowColor: "#1a1a1a",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 8,
                    },
                    tabBarItemStyle: {
                        height: TAB_HEIGHT,
                        paddingVertical: 14,
                        justifyContent: "center",
                        alignItems: "center",
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{ tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} iconName="home" title="Home" /> }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{ tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} iconName="person" title="Profile" /> }}
                />
            </Tabs>
        </View>
    );
}