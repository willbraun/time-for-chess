import { Tabs } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

import { HapticTab } from '@/components/haptic-tab'
import { SessionBar } from '@/components/session-bar'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export default function TabLayout() {
	const colorScheme = useColorScheme()

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: false,
				tabBarButton: HapticTab,
			}}
			tabBar={props => (
				<View>
					<SessionBar />
					<View
						style={{ height: 80, flexDirection: 'row', backgroundColor: Colors[colorScheme ?? 'light'].background }}
					>
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
									style={{
										flex: 1,
										alignItems: 'center',
										paddingVertical: 10,
										paddingBottom: 20,
									}}
								>
									{options.tabBarIcon?.({
										color: isFocused
											? Colors[colorScheme ?? 'light'].tabIconSelected
											: Colors[colorScheme ?? 'light'].tabIconDefault,
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
