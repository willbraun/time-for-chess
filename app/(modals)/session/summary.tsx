import { Text } from '@/components/ui/text'
import * as Haptics from 'expo-haptics'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { BounceIn } from 'react-native-reanimated'

import { AppButton } from '@/components/ui/app-button'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useColorToken } from '@/hooks/use-color-token'
import { formatDuration } from '@/lib/format'

export default function SummaryScreen() {
	const navigation = useNavigation()
	const { duration, categoryName } = useLocalSearchParams<{ duration: string; categoryName: string }>()
	const primaryColor = useColorToken('--accent')

	const durationSeconds = parseInt(duration, 10)

	useEffect(() => {
		setTimeout(() => {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
			// Delay to align with the check mark bounce animation
		}, 105)
	}, [])

	return (
		<View className='flex-1 p-6'>
			<View className='flex-1 items-center justify-center gap-8'>
				<Animated.View entering={BounceIn} className='items-center gap-3'>
					<IconSymbol name='checkmark.circle.fill' size={72} color={primaryColor} />
				</Animated.View>
				<Text className='text-2xl font-bold text-fg-primary'>Session logged!</Text>
				<View className='w-full rounded-2xl p-8 items-center gap-4 bg-surface'>
					<Text className='text-xl font-semibold uppercase tracking-widest text-fg-muted'>{categoryName}</Text>
					<Text className='text-7xl font-extralight text-fg-primary' style={{ fontVariant: ['tabular-nums'] }}>
						{formatDuration(durationSeconds)}
					</Text>
				</View>
			</View>
			<AppButton onPress={() => navigation.getParent()?.goBack()}>
				<Text className='text-fg-accent text-2xl font-semibold'>Done</Text>
			</AppButton>
		</View>
	)
}
