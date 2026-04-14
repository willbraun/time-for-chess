import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import type { CategoryDistribution } from '@/lib/recommendation'
import { StyleSheet, Text, View } from 'react-native'

export function DistributionBar({ data }: { data: CategoryDistribution }) {
	const colorScheme = useColorScheme() ?? 'light'
	const colors = Colors[colorScheme]

	const actualPct = Math.round(data.actual * 100)
	const targetPct = Math.round(data.target * 100)
	const bandLowPct = data.bandLow * 100
	const bandHighPct = data.bandHigh * 100

	const isUnder = data.actual < data.bandLow

	return (
		<View style={styles.container}>
			<View style={styles.labelRow}>
				<Text style={[styles.name, { color: colors.text }]}>{data.name}</Text>
				<Text style={[styles.percentage, { color: isUnder ? colors.accent : colors.icon }]}>
					{actualPct}%<Text style={[styles.target, { color: colors.icon }]}> / {targetPct}%</Text>
				</Text>
			</View>
			<View style={[styles.track, { backgroundColor: colors.surface }]}>
				{/* Band range */}
				<View
					style={[
						styles.band,
						{
							left: `${bandLowPct}%`,
							width: `${bandHighPct - bandLowPct}%`,
							backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
						},
					]}
				/>
				{/* Actual percentage dot */}
				<View
					style={[
						styles.dot,
						{
							left: `${Math.min(actualPct, 100)}%`,
							backgroundColor: colors.primary,
						},
					]}
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	labelRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	name: {
		fontSize: 14,
		fontWeight: '500',
	},
	percentage: {
		fontSize: 14,
		fontWeight: '600',
		fontVariant: ['tabular-nums'],
	},
	target: {
		fontWeight: '400',
		fontSize: 13,
	},
	track: {
		height: 8,
		borderRadius: 4,
		position: 'relative',
		overflow: 'visible',
	},
	band: {
		position: 'absolute',
		top: 0,
		height: '100%',
		borderRadius: 4,
	},
	dot: {
		position: 'absolute',
		top: -4,
		width: 16,
		height: 16,
		borderRadius: 8,
		marginLeft: -8,
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
})
