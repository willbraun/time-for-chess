import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Text, View } from 'react-native'

import { AppButton } from '@/components/ui/app-button'
import { formatDuration } from '@/lib/format'
import { useSession } from '@/lib/session-context'

export default function ActiveScreen() {
	const router = useRouter()
	const { activeSession, elapsedSeconds, stopSession, autoCloseResult, clearAutoCloseResult } = useSession()

	// Navigate to summary when auto-close fires while user is watching the timer
	useEffect(() => {
		if (autoCloseResult) {
			const { duration, categoryName } = autoCloseResult
			clearAutoCloseResult()
			router.replace(`/session/summary?duration=${duration}&categoryName=${encodeURIComponent(categoryName)}` as any)
		}
	}, [autoCloseResult, clearAutoCloseResult, router])

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
			<AppButton onPress={handleStop}>
				<Text className='text-white text-2xl font-semibold'>End Session</Text>
			</AppButton>
		</View>
	)
}
