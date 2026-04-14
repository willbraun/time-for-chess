import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { SectionList, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { formatDate, formatDurationMinutes, formatTime } from '@/lib/format'
import { getRecentSessions, type SessionWithCategory } from '@/lib/sessions'

interface DayGroup {
	title: string
	data: SessionWithCategory[]
}

function groupByDay(sessions: SessionWithCategory[]): DayGroup[] {
	const groups: Map<string, SessionWithCategory[]> = new Map()
	for (const session of sessions) {
		const key = formatDate(session.start_time)
		const existing = groups.get(key)
		if (existing) {
			existing.push(session)
		} else {
			groups.set(key, [session])
		}
	}
	return Array.from(groups, ([title, data]) => ({ title, data }))
}

export default function HistoryScreen() {
	const colorScheme = useColorScheme() ?? 'light'
	const colors = Colors[colorScheme]
	const insets = useSafeAreaInsets()

	const [sessions, setSessions] = useState<SessionWithCategory[]>([])
	const [totalSeconds, setTotalSeconds] = useState(0)

	useFocusEffect(
		useCallback(() => {
			async function load() {
				const recent = await getRecentSessions(30)
				setSessions(recent)
				setTotalSeconds(recent.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0))
			}
			load()
		}, []),
	)

	const sections = groupByDay(sessions)

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<SectionList
				sections={sections}
				keyExtractor={item => String(item.id)}
				contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
				ListHeaderComponent={
					<View style={styles.header}>
						<Text style={[styles.title, { color: colors.text }]}>History</Text>
						<View style={[styles.summaryRow, { backgroundColor: colors.surface }]}>
							<View style={styles.summaryItem}>
								<Text style={[styles.summaryValue, { color: colors.text }]}>{formatDurationMinutes(totalSeconds)}</Text>
								<Text style={[styles.summaryLabel, { color: colors.icon }]}>Total (30d)</Text>
							</View>
							<View style={styles.summaryItem}>
								<Text style={[styles.summaryValue, { color: colors.text }]}>{sessions.length}</Text>
								<Text style={[styles.summaryLabel, { color: colors.icon }]}>Sessions</Text>
							</View>
						</View>
					</View>
				}
				renderSectionHeader={({ section }) => (
					<Text style={[styles.sectionHeader, { color: colors.icon, backgroundColor: colors.background }]}>
						{section.title}
					</Text>
				)}
				renderItem={({ item }) => (
					<View style={[styles.sessionRow, { borderBottomColor: colors.border }]}>
						<View style={[styles.colorDot, { backgroundColor: colors.primary }]} />
						<View style={styles.sessionInfo}>
							<Text style={[styles.sessionCategory, { color: colors.text }]}>{item.category_name}</Text>
							<Text style={[styles.sessionTime, { color: colors.icon }]}>
								{formatTime(item.start_time)}
								{item.status === 'auto_closed' ? ' · auto-closed' : ''}
							</Text>
						</View>
						<Text style={[styles.sessionDuration, { color: colors.text }]}>
							{formatDurationMinutes(item.duration_seconds ?? 0)}
						</Text>
					</View>
				)}
				ListEmptyComponent={
					<View style={styles.empty}>
						<Text style={[styles.emptyText, { color: colors.icon }]}>No sessions yet. Start your first one!</Text>
					</View>
				}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 20,
		paddingBottom: 32,
	},
	header: {
		marginBottom: 8,
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		marginBottom: 16,
	},
	summaryRow: {
		flexDirection: 'row',
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
	},
	summaryItem: {
		flex: 1,
		alignItems: 'center',
	},
	summaryValue: {
		fontSize: 22,
		fontWeight: '700',
	},
	summaryLabel: {
		fontSize: 13,
		marginTop: 2,
	},
	sectionHeader: {
		fontSize: 13,
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		paddingVertical: 8,
	},
	sessionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	colorDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginRight: 12,
	},
	sessionInfo: {
		flex: 1,
	},
	sessionCategory: {
		fontSize: 15,
		fontWeight: '500',
	},
	sessionTime: {
		fontSize: 13,
		marginTop: 2,
	},
	sessionDuration: {
		fontSize: 15,
		fontWeight: '600',
		fontVariant: ['tabular-nums'],
	},
	empty: {
		alignItems: 'center',
		paddingTop: 60,
	},
	emptyText: {
		fontSize: 16,
	},
})
