import { CustomInputProps } from "@/constants/type";
import { cn } from "@/lib/utils";
import { rv } from "@/styles/responsive";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const CustomInput = ({
  placeholder = "enter text here",
  value,
  onChangeText,
  label,
  secureTextEntry = false,
  keyboardType = "default",
}: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full">
      <Text className="" style={styles.label} >{label}</Text>

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)} // but for this toe ven work 
        placeholder={placeholder}
        placeholderTextColor="#888"
        className={cn("rounded-lg  w-full  text-base text-dark-100 border leading-5 bg-white", isFocused ? "border-dark-green-ascents" : "border-gray-300") }
        style={styles.inputContainer}
      ></TextInput>
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  label: {
    fontSize: rv(14),
    fontWeight: "500",
    color: "#1F1F1F",
    marginBottom: rv(8),
  },
  inputContainer: {
    padding: rv(12),
  },
});