import { View, Text, FlatList, TouchableOpacity } from "react-native"
import { rs } from "@/styles/responsive"
import { ListingType } from "@/app_state/ventureFlowStore"

import { useVentureDraftStore } from "@/app_state/ventureFlowStore"
import { useState } from "react"

const listingTypes: { type: ListingType; label: string; icon: string }[] = [
    { type: "Room", label: "Room", icon: "🏠" },
    { type: "Hotel", label: "Hotel", icon: "🏨" },
    { type: "House", label: "House", icon: "🏡" },
    { type: "Apartment", label: "Apartment", icon: "🏢" },
    { type: "GuestHouse", label: "Guest House", icon: "🛏️" },
]


const ListingTypeOption = ({ type, label, icon, onPress, clicked}: { type: ListingType; label: string; icon: string; onPress: () => void , clicked: boolean}) => (
    <TouchableOpacity
        onPress={onPress}
        className={`flex-1 m-2 p-4  rounded-xl border  items-center justify-center
            ${clicked} ? "border-dark-green-ascents bg-green-200 " : "bg-white border-gray-200" `}
        style={{ minHeight: rs(120) }}
    >
        <Text style={{ fontSize: rs(40) }}>{icon}</Text>
        <Text className="mt-2 font-medium text-gray-800" style={{ fontSize: rs(16) }}>{label}</Text>
    </TouchableOpacity>
)

const ListingTypeChoicePage = () => {
    const handleSelectType = (type: ListingType) => {
        console.log("Selected:", type)
        // TODO: Update ventureDraft store with selected type
    }

    const draft = useVentureDraftStore(state => state.draft)
    const [selectedListingType, setSelectedListingType] = useState<ListingType | undefined>(draft?.type)


    return (
        <View className="flex-1 bg-gray-50">
            <Text className="font-semibold mx-5 mt-4" style={{ fontSize: rs(20) }}>
                Which of these matches your place best?
            </Text>

            <FlatList
                data={listingTypes}
                keyExtractor={(item) => item.type}
                numColumns={2}
                contentContainerClassName="p-4"
                columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item }) => (
                    <ListingTypeOption
                        type={item.type}
                        label={item.label}
                        icon={item.icon}
                        onPress={() => handleSelectType(item.type)}
                        clicked={item.label === selectedListingType}
                    />
                )}
            />
        </View>
    )
}

export default ListingTypeChoicePage