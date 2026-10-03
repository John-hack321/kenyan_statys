import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export const rs = (size : number) => {
    return scale(size);
}

export const rv = (size : number) => {
    return verticalScale(size);
}

export const rm = (size : number, factor? : number) => {
    return moderateScale(size);
}

