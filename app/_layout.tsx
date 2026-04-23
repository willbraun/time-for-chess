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
import {
	PlusJakartaSans_200ExtraLight,
	PlusJakartaSans_300Light,
	PlusJakartaSans_400Regular,
	PlusJakartaSans_500Medium,
	PlusJakartaSans_600SemiBold,
	PlusJakartaSans_700Bold,
	PlusJakartaSans_800ExtraBold,
	useFonts,
} from '@expo-google-fonts/plus-jakarta-sans'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

export const unstable_settings = {
	anchor: '(tabs)',
}

export default function RootLayout() {
	const colorScheme = useColorScheme()

	// Ensure DB is loaded before rendering any screens
	const [dbReady, setDbReady] = useState(false)
	useEffect(() => {
		getDatabase().then(() => setDbReady(true))
	}, [])

	// Load fonts and hide splash screen when ready
	const [loaded, error] = useFonts({
		PlusJakartaSans_200ExtraLight,
		PlusJakartaSans_300Light,
		PlusJakartaSans_400Regular,
		PlusJakartaSans_500Medium,
		PlusJakartaSans_600SemiBold,
		PlusJakartaSans_700Bold,
		PlusJakartaSans_800ExtraBold,
	})

	useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync()
		}
	}, [loaded, error])

	// Don't render anything until DB and fonts are ready
	if (!dbReady) return null

	if (!loaded && !error) {
		return null
	}

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
