import { useLocalSearchParams, useNavigation } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { IconSymbol } from '@/components/ui/icon-symbol'
import { useColorToken } from '@/hooks/use-color-token'
import { formatDuration } from '@/lib/format'

export default function SummaryScreen() {
	const navigation = useNavigation()
	const { duration, categoryName } = useLocalSearchParams<{ duration: string; categoryName: string }>()
	const primaryColor = useColorToken('--accent')

	const durationSeconds = parseInt(duration, 10)

	return (
		<View className='flex-1 p-6'>
			<View className='flex-1 items-center justify-center gap-8'>
				<View className='items-center gap-3'>
					<IconSymbol name='checkmark.circle.fill' size={72} color={primaryColor} />
					<Text className='text-2xl font-bold text-fg-primary'>Session logged!</Text>
				</View>
				<View className='w-full rounded-2xl p-8 items-center gap-4 bg-surface border border-border'>
					<Text className='font-semibold uppercase tracking-widest text-fg-muted'>{categoryName}</Text>
					<Text className='text-7xl font-extralight text-fg-primary' style={{ fontVariant: ['tabular-nums'] }}>
						{formatDuration(durationSeconds)}
					</Text>
				</View>
			</View>
			<Pressable onPress={() => navigation.getParent()?.goBack()} className='p-4 rounded-full items-center bg-accent'>
				<Text className='text-white text-2xl font-semibold'>Done</Text>
			</Pressable>
		</View>
	)
}
