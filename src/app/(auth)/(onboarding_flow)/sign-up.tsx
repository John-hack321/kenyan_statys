import CustomButton from "@/components/customButton";
import CustomInput from "@/components/customInput";
import PhoneInput from "@/components/PhoneInput";
import GoogleIcon from "@/components/google-icon";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from "react-native";

import { SignUpFormValues, signUpSchema } from "@/constants/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { useAuth } from "../../../../lib/authContext";
import * as sentry from "@sentry/react-native"
import { rv } from "@/styles/responsive";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import AppleSignInButton from "@/components/AppleSignInButton";

//  I will do scalling for the different screen sizes later on btw .

const SignUpPage = () => {

    const {signup} = useAuth()

    const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
        email: "",
        phone: "",
        first_legal_name: "",
        last_legal_name: "",
        id_number: "",
        date_of_birth: "",
        password: "",
    },
    mode: "onChange",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [usePhone, setUsePhone] = useState(true) // it will always start on the phone part.
    const [isLoading, setIsLoading] = useState(false)
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+254"); // Default to Kenya


    const submit = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert date_of_birth string to Date object for backend
        const payload = {
        ...data,
        date_of_birth: new Date(data.date_of_birth),
        phone: `${selectedCountryCode}${data.phone}`,
        };

      // call the signup functioanlity api's with payload
        console.log("Submitting:", payload);
        await signup(payload.email , payload.phone, payload.first_legal_name, payload.last_legal_name, payload.id_number, payload.date_of_birth , payload.password)

        Alert.alert("success", "you have been signed in successfuly");
        router.replace("/");
    } catch (error: any) {
        Alert.alert("error", error.message);
        sentry.captureEvent(error)
    } finally {
        setIsSubmitting(false);
    }
    };


    return (
    <View className="gap-5 bg-white rounded-lg min-h-screen p-5  items-center justify-center  flex flex-col">


        <View className ="rounded-lg px-1  py-1  flex flex-row border border-gray-100 gap-2  w-full">
            <TouchableOpacity 
            onPress={()=> setUsePhone(true)}
            className={` ${usePhone ? " bg-dark-green-ascents rounded-lg border-green" : ""} px-3 py-2 flex-1 items-center`}>
                <Text className={`${usePhone ? "text-white " : "text-black"}`}>phone</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
            onPress={()=> setUsePhone(false)}
            className={` ${usePhone == false ? " bg-dark-green-ascents rounded-lg border-green" : ""} px-3 py-2 flex-1 items-center`}>
                <Text 
                className={`${usePhone == false ? "text-white" : "text-black"}`}
                >email</Text>
            </TouchableOpacity>
            

        </View>

        {
            usePhone ? (
                <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                    <PhoneInput
                    value={value}
                    onChangeText={onChange}
                    onCountryCodeChange={setSelectedCountryCode}
                    label="Phone"
                    placeholder="enter your phone number"
                    error={errors.phone?.message}
                    />
                )}/>

            ) : (
                <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                    <CustomInput
                    placeholder="enter your email"
                    value={value}
                    onChangeText={onChange}
                    label="Email"
                    keyboardType="email-address"
                    />
                )}
                />
            )
        }

        <CustomButton
        title="Continue"
        customStyle="mt-4 font-bold rounded-lg"
        textStyle="text-white"
        leftIcon={undefined}
        isLoading={isSubmitting}
        onPress={handleSubmit(submit)}
        />

        <View className="w-full flex-row items-center justify-center gap-2">
            <View className="flex-1 bg-dark-green-ascents h-[1px]" style={{height: rv(1)}}/>
            <Text className="font-bold text-lg">Or</Text>
            <View className="flex-1 bg-dark-green-ascents h-[1px] " style={{height: rv(1)}}></View>
        </View>

        {/** the social auth buttons will now go here */}
        <View className="w-full flex flex-col gap-4">

            <GoogleSignInButton 
            text="Continue with Google"
            styles="bg-white border border-gray-300 rounded-full px-3 py-4  "/>

            <AppleSignInButton styles="bg-black rounded-full px-3 py-4" text="Continue with Apple"/>

            
        </View>

        <View className="flex items-center flex-row gap-2 justify-center">
        <Text className="text-lg text-grey-100">Already have an account ?</Text>
        <Link href="/sign-in" className="text-lg text-dark-green-ascents font-bold">
            Sign in
        </Link>
        </View>
    </View>
    );
};

export default SignUpPage;


/**
 * 
 *   <Controller
        control={control}
        name="date_of_birth"
        render={({ field: { onChange, value } }) => (
            <View>
            <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="border border-gray-300 rounded-lg p-3 bg-white"
            >
                <Text className="text-gray-500 text-sm mb-1">Date of birth</Text>
                <Text className={value ? "text-black" : "text-gray-400"}>
                {value
                    ? new Date(value).toLocaleDateString()
                    : "Select date of birth"}
                </Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                    onChange(selectedDate.toISOString());
                    }
                }}
                />
            )}
            </View>
        )}
        />



 * 
 */