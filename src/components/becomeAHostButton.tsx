import { TouchableOpacity } from "react-native";
import AppText from "@/components/AppText";

// A simple text button for places that do not need many options (it was becomeAHostButton.tsx).
// The caller decides the look with className / textClassName (colours), and what it does with onPress.
// The text itself is always AppText (Rubik, no clipping), so size and weight come from the variant.
type Props = {
    textClassName?: string;
    buttonName: string;
    className?: string;
    onPress?: () => void;
};

const TextButton = ({ textClassName = "", buttonName, className = "", onPress }: Props) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="button" className={className}>
        <AppText variant="large" weight="bold" className={textClassName} numberOfLines={1}>{buttonName}</AppText>
    </TouchableOpacity>
);

export default TextButton;

// may need to change the name to text button I guess 