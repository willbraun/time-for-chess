import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import 'react-native-reanimated'
import './../global.css'

import { getDatabase } from '@/lib/database'
import { SessionProvider } from '@/lib/session-context'
import { useColorScheme } from 'react-native'

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
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<SessionProvider>
				<Stack>
					<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
					<Stack.Screen
						name='session'
						options={{
							presentation: 'modal',
							title: 'Session',
							headerShown: false,
						}}
					/>
				</Stack>
				<StatusBar style='auto' />
			</SessionProvider>
		</ThemeProvider>
	)
}
