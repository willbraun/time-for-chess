import { usePathname } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'

import { useColorToken } from '@/hooks/use-color-token'

const TOTAL_STEPS = 4

function getStepIndex(pathname: string): number | null {
	if (pathname.endsWith('/select')) return 0
	if (pathname.endsWith('/time-choice')) return 1
	if (pathname.endsWith('/active') || pathname.endsWith('/session-reminder')) return 2
	if (pathname.endsWith('/summary')) return 3
	return null
}

export function SessionStepDots() {
	const pathname = usePathname()
	const currentStep = getStepIndex(pathname)

	return (
		<View
			style={{
				flexDirection: 'row',
				gap: 6,
				justifyContent: 'center',
				paddingBottom: 28,
				paddingTop: 8,
				opacity: currentStep !== null ? 1 : 0,
			}}
		>
			{Array.from({ length: TOTAL_STEPS }, (_, i) => (
				<AnimatedDot key={i} active={i === currentStep} />
			))}
		</View>
	)
}

function AnimatedDot({ active }: { active: boolean }) {
	const color = useColorToken('--accent')

	const width = useSharedValue(active ? 20 : 8)
	const opacity = useSharedValue(active ? 1 : 0.35)

	useEffect(() => {
		width.value = withSpring(active ? 20 : 8, { damping: 40, stiffness: 500 })
		opacity.value = withTiming(active ? 1 : 0.35, { duration: 100 })
	}, [active, width, opacity])

	const animatedStyle = useAnimatedStyle(() => ({
		width: width.value,
		opacity: opacity.value,
	}))

	return <Animated.View style={[animatedStyle, { height: 8, borderRadius: 4, backgroundColor: color }]} />
}
