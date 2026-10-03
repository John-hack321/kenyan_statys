import { SafeAreaView } from "react-native-safe-area-context";
import {Text, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import ProtectedRoute from "@/components/protectedRoute";
import { Slot, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { modeStore } from "@/app_state/user_store";

import { cn } from "@/lib/utils";
import { useState } from "react";



interface TabBarIconProps {
    focused: boolean;
    iconName: keyof typeof Ionicons.glyphMap;
    title: string;
}

const TabBarIcon = ({focused, iconName, title} : TabBarIconProps) => (
    <View className = "items-center flex min-w-20 justify-center min-h-full gap-1 mt-12">
        <Ionicons 
            name={iconName} 
            size={24} 
            color={focused ? "dark-green-ascents" : "#5D5F6D"} 
        />
        <Text className={cn('text-sm font-bold' , focused ? 'text-dark-green-ascents' : 'text-gray-200')}>
            {title}
        </Text>
    </View>
)

export default function TabsLayout () {

    const mode = modeStore((state) => state.mode)

    return (
        <SafeAreaView className="h-full">
        <ProtectedRoute>
            <StatusBar style="dark"/>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        borderTopLeftRadius: 50,
                        borderTopRightRadius: 50,
                        borderBottomLeftRadius: 50,
                        borderBottomRightRadius: 50,
                        marginHorizontal: 20,
                        height: 70,
                        position: "absolute",
                        bottom: 10,
                        backgroundColor: "white",
                        shadowColor: "#1a1a1a",
                        shadowOffset: {width: 0 , height: 2},
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 5,
                    }
                }}
            >
                    <Tabs.Screen
                        name="index"
                        options={{
                            tabBarIcon: ({focused}) => <TabBarIcon focused={focused} iconName="home" title="home"/>
                        }}
                    />
    
                    <Tabs.Screen
                        name="profile"
                        options={{
                            tabBarIcon: ({focused}) => <TabBarIcon focused={focused} iconName="person" title="profile"/>
                        }}
                    />
                
            
            </Tabs>
        </ProtectedRoute>

        </SafeAreaView>
    )
}