import { Alert, Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Image } from "react-native"
import { useState } from "react"
import AppText from "@/components/AppText"
import { rm, rv ,rs } from "@/styles/responsive"
import * as ImagePicker from "expo-image-picker"

const AddedImageComponent = () => {
    return (
        <View>
            <Text>This is an added image</Text>
        </View>
    )
}

const AddPhotosPage = () => {

    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library.
        // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
        // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
        // so the app users aren't surprised by a system dialog after picking a video.
        // See "Invoke permissions for videos" sub section for more details.
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };  

    const takePhoto = async () => {
        // Camera access always requires the user's permission.
        // Taking a photo also requires a device with a camera. The iOS Simulator
        // does not have one, so use a physical device to test this button.
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the camera is required.');
            return;
        }
      
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
      
        console.log(result);
      
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
        };
  
    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(16) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Add your listig images</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        You can always update and change this later on
                        lead with your best images .
                    </AppText>
                </View>

                <View className="px-5">

                    <View style={styles.container}>
                        <Button title="Pick an image from device" onPress={pickImage} />
                        <Button title="Take a photo" onPress={takePhoto} />
                        {image && <Image source={{ uri: image }} style={styles.image} />}
                    </View> 
                    
                    <TouchableOpacity className="flex flex-col gap-4 py-6 items-center justify-center mt-5 border rounded-lg"> {/* this button will have to have dotted border okay  */}
                        <Text>+</Text>
                        <Text>Add photos</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    )
}

export default AddPhotosPage;



const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: 200,
      height: 200,
    },
  });