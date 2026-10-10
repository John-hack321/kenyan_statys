import { useEffect, useMemo } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { useListingsStore } from '@/app_state/listing_store'
import { loadListings, loadMoreListings } from '@/api/listings'
import Search from '@/components/search'
import { TouchableOpacity } from 'react-native'
import { rv, rs, rm } from '@/styles/responsive'
import { FeaturedCard, ListingCard } from '@/components/listing_cards'

export default function Home() {
    const items = useListingsStore((s) => s.items) // listing data from zustand 

    const isLoading = useListingsStore((s) => s.isLoading)
    const isRefreshing = useListingsStore((s) => s.isRefreshing)
    const isLoadingMore = useListingsStore((s) => s.isLoadingMore)
    const error = useListingsStore((s) => s.error)

    useEffect(() => { loadListings() }, [])

    const FeaturedListings = useMemo(() => {
        return items
            .filter((item) => item.rating !== null)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 8)
    }, [items])

    return (
        
<FlatList
    data={items}
    numColumns={2}
    renderItem={({ item }) => (
        <ListingCard item={item} onPress={()=> {}} />
    )}
    keyExtractor={(item) => item.id}
    contentContainerClassName="pb-32 bg-white"
    columnWrapperClassName="flex gap-5 px-5"
    showsVerticalScrollIndicator={false}
    ListEmptyComponent={
        isLoading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
        ) : (
            <View>
                No listings found {/* find a better way to do this later on .  */}
            </View>
        )
    }
  ListHeaderComponent={() => (
    <View className='flex mx-5 gap-4 mt-4 bg-white'>
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

    )
}
