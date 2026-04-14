import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { formatDuration } from '@/lib/format'
import { useSession } from '@/lib/session-context'
import { getCategories, type Category } from '@/lib/sessions'

type Step = 'select' | 'time-choice' | 'active' | 'summary' | 'auto-close'

const PRESETS = [
	{ label: '15 min', seconds: 15 * 60 },
	{ label: '30 min', seconds: 30 * 60 },
	{ label: '45 min', seconds: 45 * 60 },
	{ label: '60 min', seconds: 60 * 60 },
]

export default function SessionScreen() {
	const router = useRouter()
	const params = useLocalSearchParams<{ category?: string }>()
	const colorScheme = useColorScheme() ?? 'light'
	const colors = Colors[colorScheme]
	const {
		activeSession,
		elapsedSeconds,
		needsAutoClose,
		startSession,
		stopSession,
		logPreset,
		confirmContinue,
		confirmStop,
	} = useSession()

	const [step, setStep] = useState<Step>('select')
	const [categories, setCategories] = useState<Category[]>([])
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
	const [completedDuration, setCompletedDuration] = useState(0)

	useEffect(() => {
		getCategories().then(setCategories)
	}, [])

	// Determine initial step based on session state
	useEffect(() => {
		if (needsAutoClose && activeSession) {
			setStep('auto-close')
			return
		}
		if (activeSession) {
			setStep('active')
			return
		}
		if (params.category) {
			const catId = parseInt(params.category, 10)
			const cat = categories.find(c => c.id === catId)
			if (cat) {
				setSelectedCategory(cat)
				setStep('time-choice')
				return
			}
		}
	}, [activeSession, needsAutoClose, params.category, categories])

	const handleSelectCategory = (category: Category) => {
		setSelectedCategory(category)
		setStep('time-choice')
	}

	const handleStartTimer = async () => {
		if (!selectedCategory) return
		await startSession(selectedCategory.id)
		setStep('active')
	}

	const handlePreset = async (seconds: number) => {
		if (!selectedCategory) return
		await logPreset(selectedCategory.id, seconds)
		setCompletedDuration(seconds)
		setStep('summary')
	}

	const handleStop = async () => {
		const elapsed = elapsedSeconds
		await stopSession()
		setCompletedDuration(elapsed)
		setStep('summary')
	}

	const handleAutoCloseContinue = () => {
		confirmContinue()
		setStep('active')
	}

	const handleAutoCloseStop = async (seconds: number) => {
		await confirmStop(seconds)
		setCompletedDuration(seconds)
		setStep('summary')
	}

	const handleDone = () => {
		router.back()
	}

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Handle bar */}
			<View style={styles.handleContainer}>
				<View style={[styles.handle, { backgroundColor: colors.icon }]} />
			</View>

			{step === 'select' && <SelectStep categories={categories} onSelect={handleSelectCategory} colors={colors} />}
			{step === 'time-choice' && selectedCategory && (
				<TimeChoiceStep
					category={selectedCategory}
					onStartTimer={handleStartTimer}
					onPreset={handlePreset}
					onBack={() => setStep('select')}
					colors={colors}
				/>
			)}
			{step === 'active' && activeSession && (
				<ActiveStep
					categoryName={activeSession.category_name}
					elapsedSeconds={elapsedSeconds}
					onStop={handleStop}
					colors={colors}
				/>
			)}
			{step === 'auto-close' && activeSession && (
				<AutoCloseStep
					categoryName={activeSession.category_name}
					onContinue={handleAutoCloseContinue}
					onStop={handleAutoCloseStop}
					colors={colors}
				/>
			)}
			{step === 'summary' && (
				<SummaryStep
					categoryName={selectedCategory?.name ?? activeSession?.category_name ?? ''}
					durationSeconds={completedDuration}
					onDone={handleDone}
					colors={colors}
				/>
			)}
		</View>
	)
}

function SelectStep({
	categories,
	onSelect,
	colors,
}: {
	categories: Category[]
	onSelect: (cat: Category) => void
	colors: typeof Colors.light
}) {
	return (
		<View style={styles.stepContainer}>
			<Text style={[styles.heading, { color: colors.text }]}>Choose a category</Text>
			<View style={styles.categoryGrid}>
				{categories.map(cat => (
					<Pressable
						key={cat.id}
						onPress={() => onSelect(cat)}
						style={[styles.categoryButton, { backgroundColor: colors.secondary }]}
					>
						<Text style={[styles.categoryButtonText, { color: '#FFFFFF' }]}>{cat.name}</Text>
					</Pressable>
				))}
			</View>
		</View>
	)
}

function TimeChoiceStep({
	category,
	onStartTimer,
	onPreset,
	onBack,
	colors,
}: {
	category: Category
	onStartTimer: () => void
	onPreset: (seconds: number) => void
	onBack: () => void
	colors: typeof Colors.light
}) {
	return (
		<View style={styles.stepContainer}>
			<Pressable onPress={onBack}>
				<Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
			</Pressable>
			<Text style={[styles.heading, { color: colors.text }]}>{category.name}</Text>
			<Text style={[styles.subheading, { color: colors.icon }]}>How do you want to log time?</Text>

			<Pressable onPress={onStartTimer} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
				<Text style={styles.primaryButtonText}>Start Timer</Text>
			</Pressable>

			<Text style={[styles.orText, { color: colors.icon }]}>or log a completed session</Text>

			<View style={styles.presetRow}>
				{PRESETS.map(p => (
					<Pressable
						key={p.seconds}
						onPress={() => onPreset(p.seconds)}
						style={[styles.presetButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
					>
						<Text style={[styles.presetText, { color: colors.text }]}>{p.label}</Text>
					</Pressable>
				))}
			</View>
		</View>
	)
}

function ActiveStep({
	categoryName,
	elapsedSeconds,
	onStop,
	colors,
}: {
	categoryName: string
	elapsedSeconds: number
	onStop: () => void
	colors: typeof Colors.light
}) {
	return (
		<View style={[styles.stepContainer, styles.activeContainer]}>
			<Text style={[styles.activeCategory, { color: colors.icon }]}>{categoryName}</Text>
			<Text style={[styles.activeTimer, { color: colors.text }]}>{formatDuration(elapsedSeconds)}</Text>
			<Pressable onPress={onStop} style={[styles.stopButton, { backgroundColor: colors.primary }]}>
				<Text style={styles.stopButtonText}>Stop</Text>
			</Pressable>
		</View>
	)
}

function AutoCloseStep({
	categoryName,
	onContinue,
	onStop,
	colors,
}: {
	categoryName: string
	onContinue: () => void
	onStop: (seconds: number) => void
	colors: typeof Colors.light
}) {
	return (
		<View style={styles.stepContainer}>
			<Text style={[styles.heading, { color: colors.text }]}>Session still open</Text>
			<Text style={[styles.subheading, { color: colors.icon }]}>
				Your {categoryName} session has been running for over an hour.
			</Text>

			<Pressable onPress={onContinue} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
				<Text style={styles.primaryButtonText}>Continue Session</Text>
			</Pressable>

			<Text style={[styles.orText, { color: colors.icon }]}>or stop and estimate your time</Text>

			<View style={styles.presetRow}>
				{PRESETS.map(p => (
					<Pressable
						key={p.seconds}
						onPress={() => onStop(p.seconds)}
						style={[styles.presetButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
					>
						<Text style={[styles.presetText, { color: colors.text }]}>{p.label}</Text>
					</Pressable>
				))}
			</View>
		</View>
	)
}

function SummaryStep({
	categoryName,
	durationSeconds,
	onDone,
	colors,
}: {
	categoryName: string
	durationSeconds: number
	onDone: () => void
	colors: typeof Colors.light
}) {
	return (
		<View style={[styles.stepContainer, styles.summaryContainer]}>
			<Text style={[styles.heading, { color: colors.text }]}>Session logged</Text>
			<View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
				<Text style={styles.summaryCategory}>{categoryName}</Text>
				<Text style={styles.summaryDuration}>{formatDuration(durationSeconds)}</Text>
			</View>
			<Pressable onPress={onDone} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
				<Text style={styles.primaryButtonText}>Done</Text>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	handleContainer: {
		alignItems: 'center',
		paddingTop: 8,
		paddingBottom: 4,
	},
	handle: {
		width: 36,
		height: 5,
		borderRadius: 3,
		opacity: 0.3,
	},
	stepContainer: {
		flex: 1,
		gap: 16,
		padding: 24,
	},
	heading: {
		fontSize: 24,
		fontWeight: '700',
	},
	subheading: {
		fontSize: 16,
		marginBottom: 24,
	},
	backText: {
		fontSize: 16,
		marginBottom: 16,
	},
	categoryGrid: {
		gap: 12,
		marginTop: 16,
	},
	categoryButton: {
		paddingVertical: 18,
		paddingHorizontal: 20,
		borderRadius: 12,
	},
	categoryButtonText: {
		fontSize: 17,
		fontWeight: '600',
		textAlign: 'center',
	},
	primaryButton: {
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		paddingHorizontal: 16,
	},
	primaryButtonText: {
		color: '#FFFFFF',
		fontSize: 17,
		fontWeight: '600',
	},
	orText: {
		textAlign: 'center',
		marginBottom: 16,
		fontSize: 14,
	},
	presetRow: {
		flexDirection: 'row',
		gap: 10,
		flexWrap: 'wrap',
	},
	presetButton: {
		flex: 1,
		minWidth: '40%',
		paddingVertical: 14,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
	},
	presetText: {
		fontSize: 15,
		fontWeight: '500',
	},
	activeContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	activeCategory: {
		fontSize: 20,
		fontWeight: '600',
		color: '#9CA3AF',
		marginBottom: 16,
	},
	activeTimer: {
		fontSize: 64,
		fontWeight: '200',
		color: '#FFFFFF',
		fontVariant: ['tabular-nums'],
		marginBottom: 48,
	},
	stopButton: {
		width: 100,
		height: 100,
		borderRadius: 50,
		alignItems: 'center',
		justifyContent: 'center',
	},
	stopButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '700',
	},
	summaryContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	summaryCard: {
		paddingVertical: 24,
		paddingHorizontal: 32,
		borderRadius: 16,
		alignItems: 'center',
	},
	summaryCategory: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 4,
	},
	summaryDuration: {
		color: '#FFFFFF',
		fontSize: 36,
		fontWeight: '300',
		fontVariant: ['tabular-nums'],
	},
})
