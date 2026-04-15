import type { CategoryDistribution } from '@/lib/recommendation'
import { Text, View } from 'react-native'

export function DistributionBar({ data }: { data: CategoryDistribution }) {
	const actualPct = Math.round(data.actual * 100)
	const targetPct = Math.round(data.target * 100)
	const bandLowPct = data.bandLow * 100
	const bandHighPct = data.bandHigh * 100

	const isUnder = data.actual < data.bandLow

	return (
		<View className='mb-4'>
			<View className='flex-row justify-between items-center mb-1.5'>
				<Text className='text-sm font-medium text-app-text'>{data.name}</Text>
				<Text
					className={`text-sm font-semibold ${isUnder ? 'text-app-accent' : 'text-app-icon'}`}
					style={{ fontVariant: ['tabular-nums'] }}
				>
					{actualPct}%<Text className='font-normal text-[13px] text-app-icon'> / {targetPct}%</Text>
				</Text>
			</View>
			<View className='h-2 rounded bg-app-surface' style={{ position: 'relative', overflow: 'visible' }}>
				{/* Band range */}
				<View
					className='absolute top-0 h-full rounded bg-black/8 dark:bg-white/10'
					style={{ left: `${bandLowPct}%`, width: `${bandHighPct - bandLowPct}%` }}
				/>
				{/* Actual percentage dot */}
				<View
					className='absolute w-4 h-4 rounded-full bg-app-primary border-2 border-white -ml-2'
					style={{ top: -4, left: `${Math.min(actualPct, 100)}%` }}
				/>
			</View>
		</View>
	)
}
