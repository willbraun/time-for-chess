import { Tabs } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

import { useColorToken } from '@/hooks/use-color-token'

import { HapticTab } from '@/components/haptic-tab'
import { SessionBar, SessionFAB } from '@/components/session-bar'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function TabLayout() {
	const tint = useColorToken('--primary')
	const icon = useColorToken('--muted-foreground')

	return (
		<View style={{ flex: 1 }}>
			<Tabs
				screenOptions={{
					tabBarActiveTintColor: tint,
					headerShown: false,
					tabBarButton: HapticTab,
				}}
				tabBar={props => (
					<View>
						<SessionBar />
						<View className='h-24 flex-row bg-secondary'>
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
											color: isFocused ? tint : icon,
											focused: isFocused,
											size: 32,
										})}
										<Text
											style={{
												color: isFocused ? tint : icon,
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
