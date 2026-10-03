import { Text, View, Button } from "react-native";
import { FlatList } from "react-native";
import * as Sentry from '@sentry/react-native';
// this is the home page for the application this is where all the home page data will be rendered.

const Index = () => {
    return (
        <FlatList
                data={[]}
                renderItem={({item, index}) => {
                    return (
                        <View>

                        </View>
                    )
                }}
                contentContainerClassName="pb-28" // don't forget ot make this screen size agnostic please
                ListHeaderComponent={() => (
                    <View className="flex items-center justify-between flex-row w-full my-5 px-5">
                        <Text className="font-bold ">wellcome back!</Text>
                    </View>
                )}
            />
    )
}

export default Index;