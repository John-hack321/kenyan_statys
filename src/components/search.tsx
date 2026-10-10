import { useLocalSearchParams, usePathname } from "expo-router";
import { useState } from "react";
import { View , Text} from "react-native"
import { Ionicons } from '@expo/vector-icons';
import { rv , rs , rm} from "@/styles/responsive";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";

const Search = () => {

    const path = usePathname()
    const params = useLocalSearchParams<{query?: string}>();
    const [search , setSearch ] = useState(params.query);

    const handleSearch = (text: string ) => setSearch(text)

    // just in case I will make the search to differ based on the input later I will have to implement debounced search down here : 
    // debounced search logic . 

    return (
        <View className="flex flex-row items-center justify-between w-full px-4 bg-[#FBFBFD]  rounded-lg border border-gray-300"
        style = {{paddingVertical: rv(2) }}>
            <View className="felx flex-1 flex-row items-center justify-start z-50">
                <Ionicons name="search" size={rs(20)} color="#888" />
                <TextInput
                    value={search}
                    onChangeText={handleSearch}
                    placeholder="search for rooms and places "
                    className="text-sm text-black-300 ml-2 flex-1"
                    style={{fontSize: rv(12), lineHeight: rv(20)}}
                />
            </View>

            {/* filter goes here*/}
            <TouchableOpacity>
                <Ionicons name="options-outline" size={20} color="#888" />
            </TouchableOpacity>
        </View>
    )
}

export default Search;