import { Text, TextProps } from "react-native";
import { rm } from "@/styles/responsive";
import { FONT_BY_WEIGHT , TEXT_VARIANTS, TextVariant, TextWeight} from "@/styles/typography";

type Props = TextProps & {
    variant?: TextVariant;
    weight?: TextWeight;   // optional: overrides the weight the variant comes with
    className?: string;    // colours etc, e.g. className="text-white"
};

// <AppText variant="small">..</AppText>   <AppText variant="title" weight="bold" className="text-white">..</AppText>
export default function AppText({ variant = "body", weight, style, className, ...rest }: Props) {
    const v = TEXT_VARIANTS[variant];
    return (
        <Text
            {...rest}
            className={`text-black-300 ${className ?? ""}`}
            style={[
                { fontSize: rm(v.size), lineHeight: rm(v.line), fontFamily: FONT_BY_WEIGHT[weight ?? v.weight] },
                style,
            ]}
        />
    );
}