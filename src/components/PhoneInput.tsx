import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "@/constants/countryCodes";
import { CountryCodePicker } from "./CountryCodePicker";
import { rv } from "@/styles/responsive";

interface PhoneInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onCountryCodeChange?: (countryCode: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  onCountryCodeChange,
  label = "Phone",
  placeholder = "Enter phone number",
  error,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [isFocused, setIsFocused] = useState(false);

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    onCountryCodeChange?.(country.dialCode);
  };

  const handlePhoneChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    onChangeText(numericText);
  };

  const displayValue = value || "";

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputContainer, isFocused ? styles.inputFocused : null, error && styles.inputError]}>
        <View style={styles.countryPickerWrapper}>
          <CountryCodePicker value={selectedCountry} onChange={handleCountryChange} />
        </View>

        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          editable={true}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: rv(10),
  },
  label: {
    fontSize: rv(14),
    fontWeight: "500",
    color: "#1F1F1F",
    marginBottom: rv(8),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: rv(8),
    backgroundColor: "white",
    height: rv(50),
  },
  inputFocused: {
    borderColor: "#064D30",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  countryPickerWrapper: {
    paddingLeft: rv(12),
    paddingRight: rv(8),
  },
  input: {
    flex: 1,
    fontSize: rv(14),
    color: "#1F1F1F",
    padding: 0,
    paddingRight: rv(12),
  },
  errorText: {
    fontSize: rv(12),
    color: "#FF3B30",
    marginTop: rv(4),
  },
});

export default PhoneInput;
