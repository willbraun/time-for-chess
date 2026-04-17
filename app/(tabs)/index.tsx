import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DistributionBar } from '@/components/distribution-bar'
import {
	calculateDistribution,
	getRecommendation,
	type CategoryDistribution,
	type Recommendation,
} from '@/lib/recommendation'
import { getCategories, getCategoryTotals } from '@/lib/sessions'

export default function HomeScreen() {
	const router = useRouter()
	const insets = useSafeAreaInsets()

	const [distribution, setDistribution] = useState<CategoryDistribution[]>([])
	const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
	const [hasData, setHasData] = useState(false)

	useFocusEffect(
		useCallback(() => {
			async function load() {
				const [categories, totals] = await Promise.all([getCategories(), getCategoryTotals(30)])
				const dist = calculateDistribution(categories, totals)
				setDistribution(dist)
				setRecommendation(getRecommendation(dist))
				setHasData(totals.length > 0)
			}
			load()
		}, []),
	)

	const handleRecommendationPress = () => {
		if (recommendation) {
			router.push({
				pathname: '/session',
				params: { category: String(recommendation.category.category_id) },
			} as any)
		} else {
			router.push('/session' as any)
		}
	}

	return (
		<ScrollView className='flex-1 bg-background' contentContainerStyle={{ paddingTop: insets.top + 16 }}>
			<View className='px-5 pb-8'>
				<Text className='text-4xl font-bold mb-4 text-foreground'>Time for Chess</Text>

				{/* Recommendation card */}
				<Pressable onPress={handleRecommendationPress}>
					{hasData && recommendation ? (
						<View className='rounded-2xl p-6 mb-6 bg-card'>
							<Text className='text-white/70 text-[13px] font-semibold uppercase tracking-[0.5px] mb-1'>
								Recommended
							</Text>
							<Text className='text-white text-[22px] font-bold mb-1'>{recommendation.category.name}</Text>
							<Text className='text-white/80 text-sm'>Tap to start a session</Text>
						</View>
					) : hasData ? (
						<View className='rounded-2xl p-6 mb-6 bg-primary'>
							<Text className='text-white text-[22px] font-bold mb-1'>You&apos;re balanced!</Text>
							<Text className='text-white/80 text-sm'>Tap to start any session</Text>
						</View>
					) : (
						<View className='rounded-2xl p-6 mb-6 bg-secondary'>
							<Text className='text-white text-[22px] font-bold mb-1'>Get started</Text>
							<Text className='text-white/80 text-sm'>Log your first session to see recommendations</Text>
						</View>
					)}
				</Pressable>

				{/* Distribution bars */}
				{hasData && (
					<View className='mt-1'>
						<Text className='text-xl font-semibold mb-4 text-foreground'>30-Day Distribution</Text>
						{distribution.map(d => (
							<DistributionBar key={d.category_id} data={d} />
						))}
					</View>
				)}
			</View>
		</ScrollView>
	)
}
