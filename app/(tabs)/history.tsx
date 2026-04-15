import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { SectionList, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
		<View className='flex-1 bg-app-bg'>
			<SectionList
				sections={sections}
				keyExtractor={item => String(item.id)}
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: insets.top + 16 }}
				ListHeaderComponent={
					<View className='mb-2'>
						<Text className='text-[28px] font-bold mb-4 text-app-text'>History</Text>
						<View className='flex-row rounded-xl p-4 mb-2 bg-app-surface'>
							<View className='flex-1 items-center'>
								<Text className='text-[22px] font-bold text-app-text'>{formatDurationMinutes(totalSeconds)}</Text>
								<Text className='text-[13px] mt-0.5 text-app-icon'>Total (30d)</Text>
							</View>
							<View className='flex-1 items-center'>
								<Text className='text-[22px] font-bold text-app-text'>{sessions.length}</Text>
								<Text className='text-[13px] mt-0.5 text-app-icon'>Sessions</Text>
							</View>
						</View>
					</View>
				}
				renderSectionHeader={({ section }) => (
					<Text className='text-[13px] font-semibold uppercase tracking-[0.5px] py-2 text-app-icon bg-app-bg'>
						{section.title}
					</Text>
				)}
				renderItem={({ item }) => (
					<View className='flex-row items-center py-3 border-b border-app-border'>
						<View className='w-2.5 h-2.5 rounded-full mr-3 bg-app-primary' />
						<View className='flex-1'>
							<Text className='text-[15px] font-medium text-app-text'>{item.category_name}</Text>
							<Text className='text-[13px] mt-0.5 text-app-icon'>
								{formatTime(item.start_time)}
								{item.status === 'auto_closed' ? ' · auto-closed' : ''}
							</Text>
						</View>
						<Text className='text-[15px] font-semibold text-app-text' style={{ fontVariant: ['tabular-nums'] }}>
							{formatDurationMinutes(item.duration_seconds ?? 0)}
						</Text>
					</View>
				)}
				ListEmptyComponent={
					<View className='items-center pt-15'>
						<Text className='text-base text-app-icon'>No sessions yet. Start your first one!</Text>
					</View>
				}
			/>
		</View>
	)
}
