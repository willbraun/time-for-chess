import * as Haptics from 'expo-haptics'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { ScrollView, View } from 'react-native'
import Animated, { BounceIn } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/text'

import { DistributionBar } from '@/components/distribution-bar'
import {
	calculateDistribution,
	getRecommendation,
	type CategoryDistribution,
	type Recommendation,
} from '@/lib/recommendation'
import { getCategories, getCategoryTotals, getCurrentStreak, getWeekSessionDays } from '@/lib/sessions'
import { ChessPawn, ChessQueen, ChevronRight } from 'lucide-react-native'
import { AppButton } from '../../components/ui/app-button'
import { useColorToken } from '../../hooks/use-color-token'

// Persists across component mounts caused by unmountOnBlur on Tabs
let _prevTodayFilled = false
let _initialLoadDone = false

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function HomeScreen() {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const fgSecondary = useColorToken('--fg-secondary')
	const fgAccent = useColorToken('--fg-accent')

	const [distribution, setDistribution] = useState<CategoryDistribution[]>([])
	const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
	const [, setHasData] = useState(false)
	const [weekDays, setWeekDays] = useState<boolean[]>(Array(7).fill(false))
	const [streak, setStreak] = useState(0)
	const [promotionKey, setPromotionKey] = useState(0)

	useFocusEffect(
		useCallback(() => {
			async function load() {
				const [categories, totals, days, currentStreak] = await Promise.all([
					getCategories(),
					getCategoryTotals(30),
					getWeekSessionDays(),
					getCurrentStreak(),
				])
				const dist = calculateDistribution(categories, totals)
				setDistribution(dist)
				setRecommendation(getRecommendation(dist))
				setHasData(totals.length > 0)
				setWeekDays(days)
				const todayFilled = days[new Date().getDay()]
				if (_initialLoadDone && !_prevTodayFilled && todayFilled) {
					setPromotionKey(k => k + 1)
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
				}
				_prevTodayFilled = todayFilled
				_initialLoadDone = true
				setStreak(currentStreak)
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
		<ScrollView className='flex-1 bg-primary' contentContainerStyle={{ paddingTop: insets.top + 16 }}>
			<View className='px-5 pb-6 flex-col gap-6'>
				<Text className='text-2xl font-semibold text-fg-primary'>Time for Chess</Text>

				{/* Streak + week calendar */}
				<View>
					<View className='flex-row items-center gap-2'>
						<Text className='text-fg-primary mb-2 text-xl font-medium'>{streak} Day Streak</Text>
					</View>
					<View className='flex-row gap-2'>
						{DAY_LABELS.map((label, i) => {
							const isToday = i === new Date().getDay()
							const isFilled = weekDays[i]
							return (
								<View key={i} className='flex-1 items-center gap-1'>
									<View
										className={`w-full rounded-xl ${isToday ? 'border-2 border-accent border-dashed' : ''} ${isFilled ? 'bg-accent' : 'bg-secondary'}`}
										style={{ aspectRatio: 1 }}
									>
										{isFilled && isToday && promotionKey > 0 ? (
											<Animated.View
												key={promotionKey}
												entering={BounceIn.springify().damping(8)}
												style={{ margin: 'auto' }}
											>
												<ChessQueen width={26} height={26} color={fgAccent} />
											</Animated.View>
										) : isFilled ? (
											<ChessQueen width={26} height={26} color={fgAccent} style={{ margin: 'auto' }} />
										) : (
											<ChessPawn width={26} height={26} color={fgSecondary} style={{ margin: 'auto' }} />
										)}
									</View>
									<Text className='text-xs text-fg-muted'>{label}</Text>
								</View>
							)
						})}
					</View>
				</View>

				{/* Recommendation card */}
				<AppButton onPress={handleRecommendationPress} variant='other'>
					<View className='rounded-2xl p-6 bg-primary bg-linear-to-r from-accent to-accent-subtle'>
						{recommendation ? (
							<View>
								<Text className='text-fg-accent/70 text-lg font-semibold uppercase tracking-widest mb-1'>
									Recommended
								</Text>
								<Text className='text-fg-accent text-3xl font-semibold mb-1'>{recommendation.category.name}</Text>
							</View>
						) : (
							<Text className='text-fg-accent text-3xl font-semibold mb-1'>You&apos;re balanced!</Text>
						)}
						<View className='flex-row items-center gap-2 justify-between'>
							<Text className='text-fg-accent/80'>{`Tap to start ${recommendation ? 'a' : 'any'} session`}</Text>
							<ChevronRight size={24} color='white' />
						</View>
					</View>
				</AppButton>

				{/* Distribution bars */}
				{distribution.length > 0 && (
					<View className='flex-col gap-4'>
						<Text className='text-xl font-semibold text-fg-primary'>30 Day Distribution</Text>
						{distribution.map(d => (
							<DistributionBar key={d.category_id} data={d} />
						))}
					</View>
				)}
			</View>
		</ScrollView>
	)
}
