export interface CustomInputProps {
    placeholder? : string;
    value?: string;
    onChangeText? : (value: string) => void;
    label: string;
    secureTextEntry?: boolean;
    keyboardType? : "default" | "email-address" | "numeric" | "phone-pad";
} 


export interface GoogleSignInButtonProps {
    styles?: string
    text: string
    //onPress: () => void
}

export interface AppleSignInButtonProps {
    styles?: string
    text: string
}