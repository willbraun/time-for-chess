import { useRouter } from 'expo-router'
import { Pressable, Text } from 'react-native'

import { formatDuration } from '@/lib/format'
import { useSession } from '@/lib/session-context'

export function SessionBar() {
	const { activeSession, elapsedSeconds } = useSession()
	const router = useRouter()

	const handlePress = () => {
		router.push('/session' as any)
	}

	if (activeSession) {
		return (
			<Pressable
				onPress={handlePress}
				className='flex-row items-center justify-center py-3 px-4 gap-2 h-15 bg-app-primary'
			>
				<Text className='text-white text-2xl font-semibold'>Active — {activeSession.category_name}</Text>
				<Text className='text-white text-2xl font-bold' style={{ fontVariant: ['tabular-nums'] }}>
					{formatDuration(elapsedSeconds)}
				</Text>
			</Pressable>
		)
	}

	return (
		<Pressable
			onPress={handlePress}
			className='flex-row items-center justify-center py-3 px-4 gap-2 h-15 bg-app-secondary'
		>
			<Text className='text-white text-2xl font-semibold'>Start Session</Text>
		</Pressable>
	)
}
