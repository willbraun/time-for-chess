import { type ReactNode } from 'react'
import { Pressable } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface AppButtonProps {
	onPress?: () => void
	variant?: 'primary' | 'surface' | 'other'
	className?: string
	children: ReactNode
}

const variantClass = {
	primary: 'rounded-full items-center p-4 bg-accent',
	surface: 'rounded-[10px] p-4 items-center bg-surface',
	other: '',
}

export function AppButton({ onPress, variant = 'primary', className = '', children }: AppButtonProps) {
	const scale = useSharedValue(1)

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}))

	return (
		<AnimatedPressable
			onPress={onPress}
			onPressIn={() => {
				scale.value = withTiming(0.95, { duration: 75 })
			}}
			onPressOut={() => {
				scale.value = withTiming(1, { duration: 75 })
			}}
			className={`${variantClass[variant]} ${className}`}
			style={animatedStyle}
		>
			{children}
		</AnimatedPressable>
	)
}
