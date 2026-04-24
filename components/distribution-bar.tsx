import { Text } from '@/components/ui/text'
import { useColorToken } from '@/hooks/use-color-token'
import { formatDurationMinutes } from '@/lib/format'
import type { CategoryDistribution } from '@/lib/recommendation'
import { useEffect, useRef, useState } from 'react'
import { type LayoutChangeEvent, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const ANIMATION_DURATION = 1500

export function DistributionBar({ data }: { data: CategoryDistribution }) {
	const actualPct = Math.round(data.actual * 100)
	const targetPct = Math.round(data.target * 100)
	const bandLowPct = data.bandLow * 100
	const bandHighPct = data.bandHigh * 100

	const successColor = useColorToken('--success')

	// Animation state
	const [barWidth, setBarWidth] = useState(0)
	const dotLeft = useSharedValue(0)
	const prevPctRef = useRef(0)
	const [displayPct, setDisplayPct] = useState(0)

	// Percentage text update that stays in sync with the dot animation.
	useEffect(() => {
		const startPct = prevPctRef.current
		prevPctRef.current = actualPct
		const startTime = Date.now()

		const id = setInterval(() => {
			const t = Math.min((Date.now() - startTime) / ANIMATION_DURATION, 1)
			const eased = 1 - Math.pow(1 - t, 3)
			setDisplayPct(Math.round(startPct + eased * (actualPct - startPct)))
			if (t >= 1) clearInterval(id)
			// 16 ms interval for ~60fps updates. The animation is time based so this is an approximation, not a frame-perfect sync, but it keeps the text updates smooth without needing to sync to the animation frames directly.
		}, 16)

		return () => clearInterval(id)
	}, [actualPct])

	// Animate dot whenever actualPct or measured bar width changes.
	// barWidth is React state so this effect correctly re-runs after first layout,
	// triggering the mount animation. dotLeft is a shared value so useAnimatedStyle
	// never closes over actualPct directly, preventing stale-closure jumps.
	useEffect(() => {
		if (barWidth > 0) {
			dotLeft.value = withTiming((barWidth * Math.min(actualPct, 100)) / 100, {
				duration: ANIMATION_DURATION,
				easing: Easing.out(Easing.cubic),
			})
		}
	}, [actualPct, barWidth, dotLeft])

	function getDotColor(): string {
		if (data.actual >= data.bandLow) return successColor
		// Sweep hue from 60° (yellow) to 0° (red) as score increases
		const hue = (1 - Math.min(1, data.score)) * 60
		return `hsl(${hue},90%,45%)`
	}

	const dotStyle = useAnimatedStyle(() => ({
		left: dotLeft.value,
	}))

	const onBarLayout = (e: LayoutChangeEvent) => {
		setBarWidth(e.nativeEvent.layout.width)
	}

	return (
		<View>
			<Text className='font-medium text-fg-primary'>{data.name}</Text>
			<View className='flex-row justify-between items-center mb-1.5'>
				<Text className='text-sm'>
					<Text className='tracking-wide font-bold' style={{ fontVariant: ['tabular-nums'], color: getDotColor() }}>
						{displayPct}%
					</Text>
					<Text className='text-fg-muted'> / {targetPct}%</Text>
				</Text>
				<Text className='text-fg-muted text-sm' style={{ fontVariant: ['tabular-nums'] }}>
					{formatDurationMinutes(data.total_seconds)}
				</Text>
			</View>
			<View
				className='h-10 rounded bg-surface'
				style={{ position: 'relative', overflow: 'visible' }}
				onLayout={onBarLayout}
			>
				{/* Band range */}
				<View
					className='absolute top-0 h-full bg-fg-primary/25'
					style={{ left: `${bandLowPct}%`, width: `${bandHighPct - bandLowPct}%` }}
				/>
				{/* Actual percentage dot */}
				<Animated.View
					className='absolute w-5 h-5 rounded-full border-2 border-fg-primary -ml-2.5'
					style={[
						{
							top: '50%',
							transform: [{ translateY: '-50%' }],
							backgroundColor: getDotColor(),
						},
						dotStyle,
					]}
				/>
			</View>
		</View>
	)
}
