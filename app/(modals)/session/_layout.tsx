import { Stack, useNavigation } from 'expo-router'
import { Pressable, View } from 'react-native'

import { SessionStepDots } from '@/components/session-step-dots'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useColorToken } from '@/hooks/use-color-token'

export default function SessionLayout() {
	const navigation = useNavigation()
	const mutedForegroundColor = useColorToken('--fg-muted')

	return (
		<View className='flex-1 bg-primary overflow-hidden'>
			{/* Handle bar */}
			<View className='flex-row items-center pt-4 px-4'>
				<View className='flex-1' />
				<View className='w-9 h-1.25 rounded opacity-30 bg-fg-muted' />
				<View className='flex-1 items-end'>
					<Pressable onPress={() => navigation.goBack()} className='p-2'>
						<IconSymbol name='xmark' size={20} color={mutedForegroundColor} />
					</Pressable>
				</View>
			</View>

			<View style={{ flex: 1, overflow: 'hidden' }}>
				<Stack
					screenOptions={{
						headerShown: false,
						animation: 'slide_from_right',
						contentStyle: { backgroundColor: 'transparent' },
					}}
				/>
			</View>

			<SessionStepDots />
		</View>
	)
}
