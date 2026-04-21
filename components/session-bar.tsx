import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppButton } from '@/components/ui/app-button'
import { formatDuration } from '@/lib/format'
import { useSession } from '@/lib/session-context'

export function SessionBar() {
	const { activeSession, elapsedSeconds } = useSession()
	const router = useRouter()

	if (!activeSession) return null

	return (
		<Pressable
			onPress={() => router.push('/session' as any)}
			className='flex-row items-center justify-center px-4 gap-4 h-15 bg-accent'
		>
			<Text className='text-white text-xl font-semibold'>{activeSession.category_name}</Text>
			<Text
				className='text-white bg-primary/20 px-2 py-1 rounded text-xl font-bold'
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
				marginHorizontal: 20,
			}}
		>
			<AppButton onPress={() => router.push('/session' as any)} className='px-8 py-4 shadow-xl'>
				<Text className='text-white text-2xl m-auto font-semibold '>Start Session</Text>
			</AppButton>
		</View>
	)
}
