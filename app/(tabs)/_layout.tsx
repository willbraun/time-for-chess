import { Tabs } from 'expo-router'
import React from 'react'
import { Text, useColorScheme, View } from 'react-native'

import { HapticTab } from '@/components/haptic-tab'
import { SessionBar, SessionFAB } from '@/components/session-bar'
import { IconSymbol } from '@/components/ui/icon-symbol'

const tint = { light: '#0a7ea4', dark: '#ffffff' }
const icon = { light: '#687076', dark: '#9BA1A6' }

export default function TabLayout() {
	const colorScheme = useColorScheme() ?? 'light'

	return (
		<View style={{ flex: 1 }}>
			<Tabs
				screenOptions={{
					tabBarActiveTintColor: tint[colorScheme],
					headerShown: false,
					tabBarButton: HapticTab,
				}}
				tabBar={props => (
					<View>
						<SessionBar />
						<View className='h-24 flex-row bg-app-secondary'>
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
										className='flex-1 items-center justify-center gap-1 mb-4'
									>
										{options.tabBarIcon?.({
											color: isFocused ? tint[colorScheme] : icon[colorScheme],
											focused: isFocused,
											size: 32,
										})}
										<Text
											style={{
												color: isFocused ? tint[colorScheme] : icon[colorScheme],
												fontSize: 12,
												fontWeight: isFocused ? '600' : '400',
											}}
										>
											{options.title}
										</Text>
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
						tabBarIcon: ({ color, size }) => <IconSymbol size={size} name='house.fill' color={color} />,
					}}
				/>
				<Tabs.Screen
					name='history'
					options={{
						title: 'History',
						tabBarIcon: ({ color, size }) => <IconSymbol size={size} name='clock.fill' color={color} />,
					}}
				/>
			</Tabs>
			<SessionFAB />
		</View>
	)
}
