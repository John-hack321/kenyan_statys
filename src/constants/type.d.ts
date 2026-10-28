export interface CustomInputProps {
    placeholder? : string;
    value?: string;
    onChangeText? : (value: string) => void;
    label: string;
    secureTextEntry?: boolean;
    keyboardType? : "default" | "email-address" | "numeric" | "phone-pad";
} 


export interface GoogleSignInButtonProps {
    styles?: string        // kept so old callers still compile; the button now draws itself
    text: string
    loginHint?: string     // asks Google to pre-select this account (e.g. the email typed in the host flow)
    sublabel?: string      // small grey line under the text, e.g. "as john@gmail.com"
    badge?: string         // small pill on the right, e.g. "Suggested"
    //onPress: () => void
}

export interface AppleSignInButtonProps {
    styles?: string
    text: string
}