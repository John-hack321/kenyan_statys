import { images } from "@/constants/images";
import { Image } from "react-native";

type GoogleIconProps = {
    size?: number;
};

const GoogleIcon = ({ size = 18 }: GoogleIconProps) => {
    return (
        <Image
            source={images.google}
            style={{ width: size, height: size }}
            resizeMode="contain"
        />
    );
};

export default GoogleIcon;
