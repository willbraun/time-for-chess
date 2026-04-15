import { Tabs } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

import { HapticTab } from '@/components/haptic-tab'
import { SessionBar } from '@/components/session-bar'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useColorScheme } from '@/hooks/use-color-scheme'

const tint = { light: '#0a7ea4', dark: '#ffffff' }
const icon = { light: '#687076', dark: '#9BA1A6' }

export default function TabLayout() {
	const colorScheme = useColorScheme() ?? 'light'

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: tint[colorScheme],
				headerShown: false,
				tabBarButton: HapticTab,
			}}
			tabBar={props => (
				<View>
					<SessionBar />
					<View className='h-20 flex-row bg-app-bg'>
						{props.state.routes.map((route, index) => {
							const { options } = props.descriptors[route.key]
							const isFocused = props.state.index === index
							return (
								<HapticTab
									key={route.key}
									accessibilityRole='button'
									accessibilityState={isFocused ? { selected: true } : {}}
									onPress={() => {
										const event = props.navigation.emit({
											type: 'tabPress',
											target: route.key,
											canPreventDefault: true,
										})
										if (!isFocused && !event.defaultPrevented) {
											props.navigation.navigate(route.name)
										}
									}}
									className='flex-1 items-center py-2.5 pb-5'
								>
									{options.tabBarIcon?.({
										color: isFocused ? tint[colorScheme] : icon[colorScheme],
										focused: isFocused,
										size: 28,
									})}
								</HapticTab>
							)
						})}
					</View>
				</View>
			)}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name='house.fill' color={color} />,
				}}
			/>
			<Tabs.Screen
				name='history'
				options={{
					title: 'History',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name='clock.fill' color={color} />,
				}}
			/>
		</Tabs>
	)
}
