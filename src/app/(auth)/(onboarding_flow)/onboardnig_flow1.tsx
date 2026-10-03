import { images } from "@/constants/images";
import { rm, rs, rv } from "@/styles/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  return (
    <SafeAreaView className="h-full bg-[#F6F3EA]">
      <StatusBar style="dark" />
      <LinearGradient
        colors={["#F8F6EF", "#E7F4EC", "#CDEBDD"]}
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
          contentContainerClassName="h-full"
          contentContainerStyle={{ paddingBottom: insets.bottom }}
        >
          <View className="flex-row items-center justify-between px-6 pt-3">
            <View className="flex-row items-center">
              <View className="mr-2 h-3 w-3 rounded-full bg-[#064D30]" />
              <Text className="text-[12px] font-bold uppercase tracking-[2px] text-[#064D30]">
                Your goals, in sight
              </Text>
            </View>

            <View className="rounded-full border border-[#064D30]/15 bg-white/60 px-3 py-1.5">
              <Text className="text-[11px] font-semibold text-[#064D30]">
                01
              </Text>
            </View>
          </View>

          <Image
            source={images.index}
            className="w-full h-2/3"
            resizeMode="contain"
            style={{ marginTop: rv(-30) }}
          ></Image>

          <View className="w-full px-4 " style={{ marginTop: rv(-150) }}>
            <Text
              className=" tracking-wider font-bold"
              style={{ fontSize: rm(59, 0.3), lineHeight: rm(58, 0.3) }}
            >
              Pin it,{" "}
            </Text>
            <Text
              className=" tracking-wider font-bold"
              style={{ fontSize: rm(59, 0.3), lineHeight: rm(59, 0.3) }}
            >
              Save for it,{" "}
            </Text>
            <Text
              className="tracking-wider text-[#064D30] font-bold"
              style={{ fontSize: rm(59, 0.3), lineHeight: rm(59, 0.3) }}
            >
              Own it.{" "}
            </Text>
          </View>

          <View
            style={{
              width: "100%",
              paddingHorizontal: rs(16),
              marginTop: rm(10, 0.2),
            }}
          >
            <Text
              style={{
                fontSize: rm(17, 0.3),
                maxWidth: rs(340),
                color: "#40584B",
                lineHeight: rm(24, 0.3),
                letterSpacing: 0.5, // see note below — don't scale this
              }}
            >
              No more raiding your savings for things you dont plan or set a
              goal. Set a goal, see it everyday, get there.
            </Text>
          </View>

          <View
            className=" flex-row flex-wrap "
            style={{
              marginHorizontal: rm(18, 0.3),
              marginTop: rm(10, 0.3),
              gap: rm(8, 0.5),
            }}
          >
            <View
              className="rounded-full bg-white/75"
              style={{
                paddingHorizontal: rm(20, 0.5),
                paddingVertical: rm(8, 0.5),
              }}
            >
              <Text
                className=" font-semibold text-[#315344]"
                style={{ fontSize: rm(11, 0.3) }}
              >
                Pin a goal
              </Text>
            </View>
            <View
              className="rounded-full bg-white/75"
              style={{
                paddingHorizontal: rm(20, 0.5),
                paddingVertical: rm(8, 0.5),
              }}
            >
              <Text
                className="font-semibold text-[#315344]"
                style={{ fontSize: rm(11, 0.3) }}
              >
                Watch it grow
              </Text>
            </View>
          </View>

          <View className="" style={{ marginTop: rv(10) }}>
            <TouchableOpacity
              className="bg-[#064D30] border border-black rounded-lg  items-center justify-center"
              style={{
                height: rm(50, 0.5),
                marginHorizontal: rs(8),
                marginTop: rv(8),
                paddingVertical: rv(8),
              }}
              activeOpacity={0.8}
              onPress={handleGetStarted}
            >
              <Text
                className="text-white  font-semibold"
                style={{ fontSize: rm(18, 0.5), lineHeight: rm(28, 0.5) }}
              >
                Get started
              </Text>
            </TouchableOpacity>

            <Text
              className="text-center  font-medium text-[#587265]"
              style={{
                marginTop: rv(16),
                fontSize: rm(12, 0.5),
                marginBottom: rv(8),
              }}
            >
              A little progress, every day.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
// I added the space next to the onboarding text because of react native's bug of clipping the text next to the end okay

/**
 * <View></View>
          
          <View className="my-6">
            <Link href="/onboarding">Get started </Link>
          </View>
 */
