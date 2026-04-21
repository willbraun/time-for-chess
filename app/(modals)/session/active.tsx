import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { formatDuration } from '@/lib/format'
import { useSession } from '@/lib/session-context'

export default function ActiveScreen() {
	const router = useRouter()
	const { activeSession, elapsedSeconds, stopSession } = useSession()

	const handleStop = async () => {
		const elapsed = elapsedSeconds
		const categoryName = activeSession?.category_name ?? ''
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
		await stopSession()
		router.replace(`/session/summary?duration=${elapsed}&categoryName=${encodeURIComponent(categoryName)}` as any)
	}

	if (!activeSession) return null

	return (
		<View className='flex-1 p-6'>
			<View className='flex-1 items-center justify-center gap-4'>
				<Text className='text-2xl font-semibold text-fg-muted'>{activeSession.category_name}</Text>
				<Text className='text-[100px] font-extralight text-fg-primary' style={{ fontVariant: ['tabular-nums'] }}>
					{formatDuration(elapsedSeconds)}
				</Text>
			</View>
			<Pressable onPress={handleStop} className='rounded-full items-center p-4 bg-accent'>
				<Text className='text-white text-2xl font-semibold'>End Session</Text>
			</Pressable>
		</View>
	)
}
