import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { formatDuration } from '@/lib/format'
import { useSession } from '@/lib/session-context'

export function SessionBar() {
	const { activeSession, elapsedSeconds } = useSession()
	const router = useRouter()

	if (!activeSession) return null

	return (
		<Pressable
			onPress={() => router.push('/session' as any)}
			className='flex-row items-center justify-center px-4 gap-4 h-15 bg-primary'
		>
			<Text className='text-white text-xl font-semibold'>{activeSession.category_name}</Text>
			<Text
				className='text-white bg-background/20 px-2 py-1 rounded text-xl font-bold'
				style={{ fontVariant: ['tabular-nums'] }}
			>
				{formatDuration(elapsedSeconds)}
			</Text>
		</Pressable>
	)
}

export function SessionFAB() {
	const { activeSession } = useSession()
	const router = useRouter()
	const insets = useSafeAreaInsets()

	if (activeSession) return null

	return (
		<View
			pointerEvents='box-none'
			style={{
				position: 'absolute',
				bottom: insets.bottom + 64,
				left: 0,
				right: 0,
				alignItems: 'center',
			}}
		>
			<Pressable
				onPress={() => router.push('/session' as any)}
				className='bg-primary rounded-full px-8 py-4'
				style={{
					elevation: 8,
					width: '90%',
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.25,
					shadowRadius: 8,
				}}
			>
				<Text className='text-white text-2xl m-auto font-semibold'>Start Session</Text>
			</Pressable>
		</View>
	)
}
