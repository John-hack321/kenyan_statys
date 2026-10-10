import { View } from "react-native";
import { ListingCard } from "./listing_cards";

<FlatList
    data={items}
    numColumns={2}
    renderItem={({ item }) => (
        <ListingCard item={item} onPress={()=> {}} />
    )}
    keyExtractor={(item) => item.$id}
    contentContainerClassName="pb-32"
    columnWrapperClassName="flex gap-5 px-5"
    showsVerticalScrollIndicator={false}
    ListEmptyComponent={
        loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
        ) : (
            <View>
                No listings found 
            </View>
        )
    }
  ListHeaderComponent={() => (
    <View className='flex mx-5 gap-4 mt-4'>
            {/** search bar and filters */}
            <Search/>
            
            <View className=''>
                <View className='flex flex-row items-center justify-between'>
                    <Text className=' text-black-300 font-bold' style={{fontSize: rv(18), lineHeight: rv(26)}}>Featured</Text>
                    <TouchableOpacity>
                        <Text className='text-dark-green-ascents font-bold'>See all</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" className="text-primary-300" />
                ) : FeaturedListings.length === 0 ? (
                    <Text className="text-center text-gray-500">No featured listings</Text>
                ) : (
                    <FlatList
                        data={FeaturedListings}
                        renderItem={({ item }) => (
                            <FeaturedCard
                                item={item}
                                onPress={() => {}}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="flex gap-5 mt-5"
                    />
                )}
            </View>

            <View className="">
                <View className="flex flex-row items-center justify-between">
                    <Text className="text-xl font-rubik-bold text-black-300">
                        Our Recommendation
                    </Text>
                    <TouchableOpacity>
                        <Text className="text-base font-rubik-bold text-dark-green-ascents">
                            See all
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* <Filters /> */}
            </View>
            
        </View>
  )}
/>
