import { Text } from '@/components/ui/text'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { Clock } from 'lucide-react-native'
import { useEffect } from 'react'
import { ScrollView, View } from 'react-native'

import { AppButton } from '@/components/ui/app-button'
import { useColorToken } from '@/hooks/use-color-token'
import { formatDuration } from '@/lib/format'
import { useSession } from '@/lib/session-context'

const PRESETS = [
	{ label: '15 min', seconds: 15 * 60 },
	{ label: '30 min', seconds: 30 * 60 },
	{ label: '45 min', seconds: 45 * 60 },
	{ label: '60 min', seconds: 60 * 60 },
	{ label: '90 min', seconds: 90 * 60 },
	{ label: '120 min', seconds: 120 * 60 },
]

export default function SessionReminderScreen() {
	const router = useRouter()
	const { activeSession, elapsedSeconds, autoCloseResult, confirmContinue, stopWithDuration, clearAutoCloseResult } =
		useSession()
	const accentColor = useColorToken('--accent')

	// If auto-close fired while on this screen, navigate to summary
	useEffect(() => {
		if (autoCloseResult) {
			const { duration, categoryName } = autoCloseResult
			clearAutoCloseResult()
			router.replace(`/session/summary?duration=${duration}&categoryName=${encodeURIComponent(categoryName)}` as any)
		}
	}, [autoCloseResult, clearAutoCloseResult, router])

	const handleContinue = () => {
		confirmContinue()
		router.replace('/session/active' as any)
	}

	const handleStop = async (seconds: number) => {
		const categoryName = activeSession?.category_name ?? ''
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
		await stopWithDuration(seconds)
		router.replace(`/session/summary?duration=${seconds}&categoryName=${encodeURIComponent(categoryName)}` as any)
	}

	if (!activeSession) return null

	return (
		<ScrollView
			contentInsetAdjustmentBehavior='automatic'
			contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 32 }}
		>
			{/* Header */}
			<View className='items-center gap-3 pt-4'>
				<Clock size={44} color={accentColor} />
				<View className='items-center gap-1'>
					<Text className='text-2xl font-bold text-fg-primary'>Session still running</Text>
					<Text className='text-base text-fg-muted'>{activeSession.category_name}</Text>
				</View>
			</View>

			{/* Elapsed timer */}
			<View className='items-center gap-1'>
				<Text
					className='text-[80px] font-extralight text-fg-primary leading-none'
					style={{ fontVariant: ['tabular-nums'] }}
				>
					{formatDuration(elapsedSeconds)}
				</Text>
				<Text className='text-xs text-fg-muted uppercase tracking-widest mt-2'>elapsed</Text>
			</View>

			{/* Primary CTAs */}
			<View className='gap-3 flex-row'>
				<AppButton onPress={handleContinue} className='flex-1 bg-secondary'>
					<Text className='text-accent-foreground text-xl font-semibold'>Continue</Text>
				</AppButton>
				<AppButton onPress={() => handleStop(elapsedSeconds)} className='flex-2'>
					<Text className='text-fg-primary text-xl font-semibold'>End Session</Text>
				</AppButton>
			</View>

			{/* Preset grid */}
			<View className='gap-3'>
				<View className='flex-row items-center gap-3'>
					<View className='flex-1 bg-border' style={{ height: 1 }} />
					<Text className='text-sm text-fg-muted'>or estimate your time</Text>
					<View className='flex-1 bg-border' style={{ height: 1 }} />
				</View>
				<View className='flex-row flex-wrap gap-2.5'>
					{PRESETS.map(p => (
						<AppButton
							key={p.seconds}
							variant='surface'
							onPress={() => handleStop(p.seconds)}
							className='flex-1 min-w-[30%] py-5'
						>
							<Text className='text-base font-medium text-fg-primary'>{p.label}</Text>
						</AppButton>
					))}
				</View>
			</View>
		</ScrollView>
	)
}
