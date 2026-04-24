import { Text } from '@/components/ui/text'
import { useRouter } from 'expo-router'
import { Pressable } from 'react-native'

import { formatDuration } from '@/lib/format'
import { useSession } from '@/lib/session-context'

export function SessionBar() {
	const { activeSession, elapsedSeconds } = useSession()
	const router = useRouter()

	if (!activeSession) return null

	return (
		<Pressable
			onPress={() => router.push('/session' as any)}
			className='flex-row items-center justify-center px-4 gap-4 h-16 bg-accent'
		>
			<Text className='text-fg-accent text-xl font-semibold'>{activeSession.category_name}</Text>
			<Text
				className='text-fg-accent bg-accent-subtle/40 px-2 py-1 rounded text-xl font-bold'
				style={{ fontVariant: ['tabular-nums'] }}
			>
				{formatDuration(elapsedSeconds)}
			</Text>
		</Pressable>
	)
}
