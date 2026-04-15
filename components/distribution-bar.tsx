import type { CategoryDistribution } from '@/lib/recommendation'
import { Text, View } from 'react-native'

export function DistributionBar({ data }: { data: CategoryDistribution }) {
	const actualPct = Math.round(data.actual * 100)
	const targetPct = Math.round(data.target * 100)
	const bandLowPct = data.bandLow * 100
	const bandHighPct = data.bandHigh * 100

	const isUnder = data.actual < data.bandLow

	function getDotColor(): string {
		if (data.actual >= data.bandLow) return '#22c55e'
		// Sweep hue from 60° (yellow) to 0° (red) as score increases
		const hue = (1 - Math.min(1, data.score)) * 60
		return `hsl(${hue},90%,45%)`
	}

	return (
		<View className='mb-4'>
			<View className='flex-row justify-between items-center mb-1.5'>
				<Text className=' font-medium text-app-text'>{data.name}</Text>
				<Text
					className={` font-semibold ${isUnder ? 'text-app-accent' : 'text-app-icon'}`}
					style={{ fontVariant: ['tabular-nums'], color: getDotColor() }}
				>
					{actualPct}%<Text className='font-normal text-[13px] text-app-icon'> / {targetPct}%</Text>
				</Text>
			</View>
			<View className='h-10 rounded bg-app-surface' style={{ position: 'relative', overflow: 'visible' }}>
				{/* Band range */}
				<View
					className='absolute top-0 h-full bg-black/8 dark:bg-white/20'
					style={{ left: `${bandLowPct}%`, width: `${bandHighPct - bandLowPct}%` }}
				/>
				{/* Actual percentage dot */}
				<View
					className='absolute w-5 h-5 rounded-full border-2 border-white -ml-2.5'
					style={{
						top: '50%',
						left: `${Math.min(actualPct, 100)}%`,
						transform: [{ translateY: '-50%' }],
						backgroundColor: getDotColor(),
					}}
				/>
			</View>
		</View>
	)
}
