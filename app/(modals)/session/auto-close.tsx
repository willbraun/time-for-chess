import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { useSession } from '@/lib/session-context'

const PRESETS = [
	{ label: '15 min', seconds: 15 * 60 },
	{ label: '30 min', seconds: 30 * 60 },
	{ label: '45 min', seconds: 45 * 60 },
	{ label: '60 min', seconds: 60 * 60 },
]

export default function AutoCloseScreen() {
	const router = useRouter()
	const { activeSession, confirmContinue, confirmStop } = useSession()

	const handleContinue = () => {
		confirmContinue()
		router.replace('/session/active' as any)
	}

	const handleStop = async (seconds: number) => {
		const categoryName = activeSession?.category_name ?? ''
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
		await confirmStop(seconds)
		router.replace(`/session/summary?duration=${seconds}&categoryName=${encodeURIComponent(categoryName)}` as any)
	}

	if (!activeSession) return null

	return (
		<View className='flex-1 gap-4 p-6'>
			<Text className='text-2xl font-bold text-fg-primary'>Session still open</Text>
			<Text className='text-base mb-6 text-fg-muted'>
				Your {activeSession.category_name} session has been running for over an hour.
			</Text>

			<Pressable onPress={handleContinue} className='py-4 rounded-xl items-center px-4 bg-accent'>
				<Text className='text-white text-2xl font-semibold'>Continue Session</Text>
			</Pressable>

			<Text className='text-center mb-4 text-sm text-fg-muted'>or stop and estimate your time</Text>

			<View className='flex-row gap-2.5 flex-wrap'>
				{PRESETS.map(p => (
					<Pressable
						key={p.seconds}
						onPress={() => handleStop(p.seconds)}
						className='flex-1 min-w-[40%] py-12 rounded-[10px] border border-border items-center bg-surface'
					>
						<Text className='text-2xl font-medium text-fg-primary'>{p.label}</Text>
					</Pressable>
				))}
			</View>
		</View>
	)
}
