import { HapticTab } from '@/components/haptic-tab'
import { SessionBar } from '@/components/session-bar'
import { useColorToken } from '@/hooks/use-color-token'
import { Tabs } from 'expo-router'
import { History, Home } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'

export default function TabLayout() {
	const tint = useColorToken('--accent')
	const icon = useColorToken('--fg-secondary')

	return (
		<View style={{ flex: 1 }}>
			<Tabs
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
										className='flex-1 items-center justify-center gap-1 mb-2'
									>
										{options.tabBarIcon?.({
											color: isFocused ? tint : icon,
											focused: isFocused,
											size: 32,
										})}
										<Text
											style={{
												color: isFocused ? 'white' : icon,
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
						headerShown: false,
						tabBarIcon: ({ color, size, focused }) =>
							focused ? (
								<View style={{ width: size, height: size }}>
									<Home size={size} color={color} fill={color} strokeWidth={1.5} />
									<Home size={size} color='#fff' style={{ position: 'absolute', top: 0, left: 0 }} strokeWidth={1.5} />
								</View>
							) : (
								<Home size={size} color={color} strokeWidth={1.5} />
							),
					}}
				/>
				<Tabs.Screen
					name='history'
					options={{
						title: 'History',
						headerShown: false,
						tabBarIcon: ({ color, size, focused }) => (
							<History size={size} color={focused ? '#fff' : color} fill={focused ? color : 'none'} strokeWidth={1.5} />
						),
					}}
				/>
			</Tabs>
		</View>
	)
}
