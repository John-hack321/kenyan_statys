import { Text, TouchableOpacity } from "react-native";

// A simple text button for places that do not need many options (it was becomeAHostButton.tsx).
// The caller decides the look with className / textClassName, and what it does with onPress.
type Props = {
    textClassName: string;
    buttonName: string;
    className?: string;
    onPress?: () => void;
};

const TextButton = ({ textClassName, buttonName, className = "", onPress }: Props) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="button" className={className}>
        <Text className={textClassName}>{buttonName}</Text>
    </TouchableOpacity>
);

export default TextButton;
