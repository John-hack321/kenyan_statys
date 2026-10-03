
import CustomButton from "@/components/customButton";
import CustomInput from "@/components/customInput";
import PhoneInput from "@/components/PhoneInput";
import GoogleIcon from "@/components/google-icon";
import { signInFormValues, signInSchema } from "@/constants/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../../lib/authContext";
import { Alert } from "react-native";

import { rv, rm } from "@/styles/responsive";

import * as sentry from "@sentry/react-native"
import GoogleSignInButton from "@/components/GoogleSignInButton";
import AppleSignInButton from "@/components/AppleSignInButton";

const SignIn = () => {

    const {login} = useAuth()

    const {
        control,
        handleSubmit,
        formState: {errors},
        watch,
    } = useForm<signInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onChange"
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+254"); // Default to Kenya

    const submit = async (data : signInFormValues) => {
        setIsSubmitting(true)
        try {
            // call the sigin in function here
            const phoneWithCode = data.phone ? `${selectedCountryCode}${data.phone}` : undefined;
            const identifier = usePhone ? phoneWithCode : data.email;
            
            if (!identifier) {
                throw new Error("Please enter either email or phone number");
            }
            
            console.log("submiting", { ...data, phone: phoneWithCode });
            await login(identifier, data.password)

        } catch (error: any) {
            Alert.alert("error", error.message);
            sentry.captureEvent(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const [usePhone , setUsePhone] = useState(false)

    return (
        <View className="gap-5 bg-white rounded-lg min-h-screen p-5 items-center justify-center flex flex-col">

            <Text className="text-black text-lg text-center " style={{fontSize: rm(20)}} >Welcome back!</Text>

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
                    value={value || ""}
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
                render={({field: {onChange, value}}) => (
                    <CustomInput
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    label="Email"
                    keyboardType="email-address"
                    />
            )}
            />
            )
        }

            <Controller
            control={control}
            name="password"
            render={({field: {onChange, value}}) => (
                <CustomInput
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                label="Passowrd"
                secureTextEntry={true}
                />
            )}
            />

            <CustomButton
                title="Continue"
                customStyle="mt-4 font-bold rounded-lg"
                textStyle="text-white"
                leftIcon={undefined}
                isLoading={isSubmitting}
                onPress={handleSubmit(submit)}
            />

            <Text className="text-black text-center">Or continue with </Text>

            <View className="flex flex-row" style={{gap: rv(10)}}>

                <GoogleSignInButton
                text="Google"
                styles="bg-white border border-gray-300 items-center justify-center rounded-lg p-2 flex-1 flex-row"/>

                <AppleSignInButton 
                text="Apple"
                styles="bg-black items-center justify-center rounded-lg p-2 flex-1 flex-row"/>
s
            </View>

            <View className="flex items-center flex-row gap-2 justify-center">
                <Text className="text-lg text-grey-100">Don't have an account ?</Text>
                <Link href="/sign-up" className="text-lg text-dark-green-ascents">Sign up</Link>
            </View>

        </View>
    );
}

export default SignIn;

