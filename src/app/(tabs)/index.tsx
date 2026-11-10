import { useEffect, useMemo } from 'react'
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useListingsStore } from '@/app_state/listing_store'
import { loadListings, loadMoreListings } from '@/api/listings'
import Search from '@/components/search'
import AppText from '@/components/AppText'
import AppRefreshControl from '@/components/AppRefreshControl'
import { FeaturedCard, ListingCard } from '@/components/listing_cards'
import { FeaturedCardSkeleton, FeedSkeleton } from '@/components/Skeleton'
import { COLORS } from '@/styles/colors'
import { rm, rs } from '@/styles/responsive'

const SectionHeader = ({ title }: { title: string }) => (
    <View className="flex-row items-center justify-between">
        <AppText variant="title" weight="bold" numberOfLines={1} style={{ flex: 1 }}>{title}</AppText>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`See all ${title}`} hitSlop={12} style={{ marginLeft: rs(8), flexShrink: 0 }}>
            <AppText variant="body" weight="bold" className="text-dark-green-ascents" numberOfLines={1}>See all</AppText>
        </TouchableOpacity>
    </View>
)

// The one place that draws "something went wrong, try again" for the feed.
const ErrorNotice = ({ message }: { message: string }) => (
    <View className="items-center" style={{ paddingVertical: rm(24), gap: rm(10) }}>
        <Ionicons name="cloud-offline-outline" size={rm(32)} color={COLORS.faint} />
        <AppText variant="body" className="text-center text-gray-500">{message}</AppText>
        <TouchableOpacity
            onPress={() => loadListings()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            className="items-center justify-center rounded-xl border border-gray-300"
            style={{ minHeight: rm(44), paddingHorizontal: rs(20) }}
        >
            <AppText variant="body" weight="semibold">Try again</AppText>
        </TouchableOpacity>
    </View>
)

export default function Home() {
    const insets = useSafeAreaInsets()
    const items = useListingsStore((s) => s.items) // listing data from zustand
    const isLoading = useListingsStore((s) => s.isLoading)
    const isRefreshing = useListingsStore((s) => s.isRefreshing)
    const isLoadingMore = useListingsStore((s) => s.isLoadingMore)
    const error = useListingsStore((s) => s.error)

    useEffect(() => { loadListings() }, [])

    // [...items] because .sort() changes the array it is called on, and this one belongs to the store
    const FeaturedListings = useMemo(() => {
        return [...items]
            .filter((item) => item.rating !== null)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 8)
    }, [items])

    const showFeatured = FeaturedListings.length > 0
    const firstLoad = isLoading && items.length === 0 // nothing to show yet: draw placeholders, not a spinner

    return (
        <FlatList
            data={items}
            numColumns={2}
            renderItem={({ item }) => <ListingCard item={item} onPress={() => {}} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 160 }}
            columnWrapperStyle={{ gap: rs(16), paddingHorizontal: rs(20) }}
            showsVerticalScrollIndicator={false}
            refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={() => loadListings()} />}
            onEndReached={() => loadMoreListings()}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
                isLoading ? (
                    <FeedSkeleton />
                ) : error ? (
                    <ErrorNotice message={error} />
                ) : (
                    <AppText variant="body" className="text-center text-gray-500" style={{ marginTop: rm(20) }}>
                        No listings found
                    </AppText>
                )
            }
            ListFooterComponent={
                isLoadingMore ? <ActivityIndicator color={COLORS.green} style={{ marginVertical: rm(16) }} />
                : error && items.length > 0 ? <ErrorNotice message={error} />
                : null
            }
            ListHeaderComponent={
                <View className="bg-white" style={{ marginHorizontal: rs(20), marginTop: rm(16), gap: rm(16) }}>
                    {/** search bar and filters */}
                    <Search />

                    {firstLoad && (
                        <View>
                            <SectionHeader title="Featured" />
                            <View className="flex-row" style={{ gap: rs(16), marginTop: rm(16) }}>
                                <FeaturedCardSkeleton />
                                <FeaturedCardSkeleton />
                            </View>
                        </View>
                    )}

                    {showFeatured && (
                        <View>
                            <SectionHeader title="Featured" />
                            <FlatList
                                data={FeaturedListings}
                                renderItem={({ item }) => <FeaturedCard item={item} onPress={() => {}} />}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: rs(16), marginTop: rm(16) }}
                            />
                        </View>
                    )}

                    {items.length > 0 && <SectionHeader title="Our recommendation" />}
                </View>
            }
        />
    )
}