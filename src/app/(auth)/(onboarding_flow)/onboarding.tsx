import { images } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Dimensions } from "react-native";

import { rm } from "@/styles/responsive";
// rm : moderate , rs: scale, rv: vertiacalscale
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const insets = useSafeAreaInsets();
  console.log("bottom inset:", insets.bottom);

  const handleCreateAccountButtonClick = () => {
    console.log("the create account button has been clicked");
  };

  const handleLoginButtonClick = () => {
    console.log("the login button has been clicked");
  };

  const {width , height } = Dimensions.get('window');

  return (
    <SafeAreaView className="h-full">
      <StatusBar style="dark" />
      <LinearGradient
        colors={["#CDEBDD", "white", "white"]}
        locations={[0, 0.58, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        className=""
        style={{ flex: 1 }}
      >
        {/* Soft shapes give the hero area some depth without competing with the artwork. */}
        <View
          pointerEvents="none"
          className="absolute -right-24 -top-20 h-72 w-72 rounded-full"
          style={{ backgroundColor: "#B8E8CD", opacity: 0.55 }}
        />
        <View
          pointerEvents="none"
          className="absolute -left-24 top-[290px] h-48 w-48 rounded-full"
          style={{ backgroundColor: "#F3D9A7", opacity: 0.26 }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName=""
          style={{}}
          contentContainerStyle={{ flex:1 , justifyContent: "space-between"}}
        >
          <Image
            source={images.onboarding}
            className=""
            style={{flex:1, width: '100%'}}
            resizeMode="contain"
            //style={{height: height * 0.6667, width: width * 1}}
          ></Image>

          <View
            className="w-full"
            style={{ paddingHorizontal: rm(16, 0.5), marginTop: rm(-80, 0.5) }}
          >
            <Text
              className="tracking-wider font-bold"
              style={{ fontSize: rm(49, 0.3), lineHeight: rm(48, 0.3) }}
            >
              Pin it,{" "}
            </Text>
            <Text
              className="tracking-wider font-bold"
              style={{ fontSize: rm(49, 0.3), lineHeight: rm(48, 0.3) }}
            >
              Save for it,{" "}
            </Text>
            <Text
              className="tracking-wider text-[#064D30] font-bold"
              style={{ fontSize: rm(49, 0.3), lineHeight: rm(48, 0.3) }}
            >
              Own it.{" "}
            </Text>
          </View>

          <View
            className=""
            style={{
              marginTop: rm(8, 0.5),
              paddingTop: rm(8, 0.5),
              gap: rm(4, 0.5),
              paddingHorizontal: rm(16, 0.5),
            }}
          >
            <TouchableOpacity
              className="bg-dark-green-ascents border-dark-green-ascents rounded-lg items-center justify-center"
              style={{
                borderWidth: rm(2, 0.3),
                marginBottom: rm(12, 0.5),
                marginHorizontal: rm(8, 0.5),
                paddingVertical: rm(8, 0.5),
              }}
              activeOpacity={0.8}
              onPress={handleCreateAccountButtonClick}
            >
              <Text
                className="text-white text-[24px] font-semibold"
                style={{ fontSize: rm(18, 0.5) }}
              >
                Create account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-transparent  border-dark-green-ascents rounded-lg items-center justify-center"
              style={{
                borderWidth: rm(2, 0.3),
                marginBottom: rm(12, 0.5),
                marginHorizontal: rm(8, 0.5),
                paddingVertical: rm(8, 0.5),
              }}
              activeOpacity={0.8}
              onPress={handleLoginButtonClick}
            >
              <Text
                className="text-dark-green-ascents font-semibold"
                style={{ fontSize: rm(18, 0.5) }}
              >
                log in
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            className="text-center font-medium text-[#587265]"
            style={{ marginTop: rm(20, 0.5), fontSize: rm(12, 0.3) }}
          >
            A little progress, every day.
          </Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
// I added the space next to the onboarding text because of react native's bug of clipping the text next to the end okay
