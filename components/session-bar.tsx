import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'

import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { formatDuration } from '@/lib/format'
import { useSession } from '@/lib/session-context'

export function SessionBar() {
	const { activeSession, elapsedSeconds } = useSession()
	const router = useRouter()
	const colorScheme = useColorScheme() ?? 'light'
	const colors = Colors[colorScheme]

	const handlePress = () => {
		router.push('/session' as any)
	}

	if (activeSession) {
		return (
			<Pressable onPress={handlePress} style={[styles.bar, { backgroundColor: colors.primary }]}>
				<Text style={styles.activeText}>Active — {activeSession.category_name}</Text>
				<Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>
			</Pressable>
		)
	}

	return (
		<Pressable onPress={handlePress} style={[styles.bar, { backgroundColor: colors.secondary }]}>
			<Text style={styles.startText}>Start Session</Text>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	bar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		gap: 8,
		height: 60,
	},
	startText: {
		color: '#FFFFFF',
		fontSize: 24,
		fontWeight: '600',
	},
	activeText: {
		color: '#FFFFFF',
		fontSize: 24,
		fontWeight: '600',
	},
	timer: {
		color: '#FFFFFF',
		fontSize: 24,
		fontWeight: '700',
		fontVariant: ['tabular-nums'],
	},
})
