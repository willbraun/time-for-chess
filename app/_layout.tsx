import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import './../global.css'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { getDatabase } from '@/lib/database'
import { SessionProvider } from '@/lib/session-context'

export const unstable_settings = {
	anchor: '(tabs)',
}

export default function RootLayout() {
	const colorScheme = useColorScheme()
	const [dbReady, setDbReady] = useState(false)

	useEffect(() => {
		getDatabase().then(() => setDbReady(true))
	}, [])

	if (!dbReady) return null

	return (
		<GestureHandlerRootView className='flex-1'>
			<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
				<SessionProvider>
					<Stack>
						<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
						<Stack.Screen
							name='(modals)/session'
							options={{
								presentation: 'modal',
								headerShown: false,
							}}
						/>
					</Stack>
					<StatusBar style='auto' />
				</SessionProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	)
}
