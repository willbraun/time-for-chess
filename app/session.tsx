import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'

import { IconSymbol } from '@/components/ui/icon-symbol'
import { useColorToken } from '@/hooks/use-color-token'
import { formatDuration } from '@/lib/format'
import { useSession } from '@/lib/session-context'
import { getCategories, type Category } from '@/lib/sessions'

const SCREEN_WIDTH = Dimensions.get('window').width

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
	const [outgoingStep, setOutgoingStep] = useState<Step | null>(null)
	const [categories, setCategories] = useState<Category[]>([])
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
	const [completedDuration, setCompletedDuration] = useState(0)

	const exitX = useSharedValue(0)
	const enterX = useSharedValue(0)
	const exitStyle = useAnimatedStyle(() => ({ transform: [{ translateX: exitX.value }] }))
	const enterStyle = useAnimatedStyle(() => ({ transform: [{ translateX: enterX.value }] }))
	const initializedRef = useRef(false)

	const transition = (next: Step, direction: 'forward' | 'back') => {
		const sign = direction === 'forward' ? 1 : -1
		setOutgoingStep(step)
		setStep(next)
		exitX.value = 0
		enterX.value = sign * SCREEN_WIDTH
		exitX.value = withTiming(-sign * SCREEN_WIDTH, { duration: 280 })
		enterX.value = withTiming(0, { duration: 280 }, finished => {
			if (finished) runOnJS(setOutgoingStep)(null)
		})
	}

	const goForward = (next: Step) => transition(next, 'forward')
	const goBack = (next: Step) => transition(next, 'back')

	useEffect(() => {
		getCategories().then(setCategories)
	}, [])

	// Determine initial step based on session state
	useEffect(() => {
		if (initializedRef.current) return
		if (needsAutoClose && activeSession) {
			initializedRef.current = true
			setStep('auto-close')
			return
		}
		if (activeSession) {
			initializedRef.current = true
			setStep('active')
			return
		}
		if (params.category) {
			const catId = parseInt(params.category, 10)
			const cat = categories.find(c => c.id === catId)
			if (cat) {
				initializedRef.current = true
				setSelectedCategory(cat)
				setStep('time-choice')
				return
			}
		}
	}, [activeSession, needsAutoClose, params.category, categories])

	const handleSelectCategory = (category: Category) => {
		setSelectedCategory(category)
		goForward('time-choice')
	}

	const handleStartTimer = async () => {
		if (!selectedCategory) return
		await startSession(selectedCategory.id)
		goForward('active')
	}

	const handlePreset = async (seconds: number) => {
		if (!selectedCategory) return
		await logPreset(selectedCategory.id, seconds)
		setCompletedDuration(seconds)
		goForward('summary')
	}

	const handleStop = async () => {
		const elapsed = elapsedSeconds
		await stopSession()
		setCompletedDuration(elapsed)
		goForward('summary')
	}

	const handleAutoCloseContinue = () => {
		confirmContinue()
		goForward('active')
	}

	const handleAutoCloseStop = async (seconds: number) => {
		await confirmStop(seconds)
		setCompletedDuration(seconds)
		goForward('summary')
	}

	const handleDone = () => {
		router.dismiss()
	}

	const renderStepContent = (s: Step) => {
		switch (s) {
			case 'select':
				return <SelectStep categories={categories} onSelect={handleSelectCategory} />
			case 'time-choice':
				return selectedCategory ? (
					<TimeChoiceStep
						category={selectedCategory}
						onStartTimer={handleStartTimer}
						onPreset={handlePreset}
						onBack={() => goBack('select')}
					/>
				) : null
			case 'active':
				return activeSession ? (
					<ActiveStep categoryName={activeSession.category_name} elapsedSeconds={elapsedSeconds} onStop={handleStop} />
				) : null
			case 'auto-close':
				return activeSession ? (
					<AutoCloseStep
						categoryName={activeSession.category_name}
						onContinue={handleAutoCloseContinue}
						onStop={handleAutoCloseStop}
					/>
				) : null
			case 'summary':
				return (
					<SummaryStep
						categoryName={selectedCategory?.name ?? activeSession?.category_name ?? ''}
						durationSeconds={completedDuration}
						onDone={handleDone}
					/>
				)
		}
	}

	const stepDotIndex: number | null =
		step === 'select' ? 0 : step === 'time-choice' ? 1 : step === 'active' || step === 'auto-close' ? 2 : null
	const mutedForegroundColor = useColorToken('--fg-muted')

	return (
		<View className='flex-1 bg-primary overflow-hidden'>
			{/* Handle bar */}
			<View className='flex-row items-center pt-4 px-4'>
				<View className='flex-1' />
				<View className='w-9 h-1.25 rounded opacity-30 bg-fg-muted' />
				<View className='flex-1 items-end'>
					<Pressable onPress={handleDone} className='p-2'>
						<IconSymbol name='xmark' size={20} color={mutedForegroundColor} />
					</Pressable>
				</View>
			</View>

			<View style={{ flex: 1, overflow: 'hidden' }}>
				{outgoingStep && (
					<Animated.View style={[StyleSheet.absoluteFill, exitStyle]}>{renderStepContent(outgoingStep)}</Animated.View>
				)}
				<Animated.View style={[{ flex: 1 }, enterStyle]}>{renderStepContent(step)}</Animated.View>
			</View>

			<StepDots currentStep={stepDotIndex} />
		</View>
	)
}

function SelectStep({ categories, onSelect }: { categories: Category[]; onSelect: (cat: Category) => void }) {
	return (
		<View className='flex-1 gap-4 p-6'>
			<Text className='text-3xl font-bold text-fg-primary'>Choose a category</Text>
			<View className='gap-3 mt-4'>
				{categories.map(cat => (
					<Pressable key={cat.id} onPress={() => onSelect(cat)} className='py-4.5 px-5 rounded-xl bg-secondary'>
						<Text className='text-2xl font-semibold text-center text-white'>{cat.name}</Text>
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
}: {
	category: Category
	onStartTimer: () => void
	onPreset: (seconds: number) => void
	onBack: () => void
}) {
	return (
		<View className='flex-1 p-6'>
			<View className='flex-1 gap-6'>
				{/* Header */}
				<View className='flex-row items-center gap-3'>
					<Pressable onPress={onBack} className='p-1 -ml-1'>
						<Text className='text-2xl text-accent'>←</Text>
					</Pressable>
					<Text className='text-3xl font-bold text-fg-primary'>{category.name}</Text>
				</View>

				{/* Preset grid */}
				<View className='gap-3'>
					<Text className='text-sm font-semibold uppercase tracking-widest text-fg-muted mt-4'>
						Log a completed session
					</Text>
					<View className='flex-row gap-2.5 flex-wrap'>
						{PRESETS.map(p => (
							<Pressable
								key={p.seconds}
								onPress={() => onPreset(p.seconds)}
								className='flex-1 min-w-[40%] py-12 rounded-[10px] border border-border items-center bg-surface'
							>
								<Text className='text-2xl font-medium text-fg-primary'>{p.label}</Text>
							</Pressable>
						))}
					</View>
				</View>
			</View>

			{/* Start Timer pinned to bottom */}
			<View className='gap-3'>
				<Pressable onPress={onStartTimer} className='rounded-full items-center p-4 bg-accent'>
					<Text className='text-white text-2xl font-semibold'>Start Timer</Text>
				</Pressable>
			</View>
		</View>
	)
}

function ActiveStep({
	categoryName,
	elapsedSeconds,
	onStop,
}: {
	categoryName: string
	elapsedSeconds: number
	onStop: () => void
}) {
	return (
		<View className='flex-1 p-6'>
			<View className='flex-1 items-center justify-center gap-4'>
				<Text className='text-2xl font-semibold text-fg-muted'>{categoryName}</Text>
				<Text className='text-[100px] font-extralight text-fg-primary' style={{ fontVariant: ['tabular-nums'] }}>
					{formatDuration(elapsedSeconds)}
				</Text>
			</View>
			<Pressable onPress={onStop} className='rounded-full items-center p-4 bg-accent'>
				<Text className='text-white text-2xl font-semibold'>End Session</Text>
			</Pressable>
		</View>
	)
}

function AutoCloseStep({
	categoryName,
	onContinue,
	onStop,
}: {
	categoryName: string
	onContinue: () => void
	onStop: (seconds: number) => void
}) {
	return (
		<View className='flex-1 gap-4 p-6'>
			<Text className='text-2xl font-bold text-fg-primary'>Session still open</Text>
			<Text className='text-base mb-6 text-fg-muted'>
				Your {categoryName} session has been running for over an hour.
			</Text>

			<Pressable onPress={onContinue} className='py-4 rounded-xl items-center px-4 bg-accent'>
				<Text className='text-white text-2xl font-semibold'>Continue Session</Text>
			</Pressable>

			<Text className='text-center mb-4 text-sm text-fg-muted'>or stop and estimate your time</Text>

			<View className='flex-row gap-2.5 flex-wrap'>
				{PRESETS.map(p => (
					<Pressable
						key={p.seconds}
						onPress={() => onStop(p.seconds)}
						className='flex-1 min-w-[40%] py-12 rounded-[10px] border border-border items-center bg-surface'
					>
						<Text className='text-2xl font-medium text-fg-primary'>{p.label}</Text>
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
}: {
	categoryName: string
	durationSeconds: number
	onDone: () => void
}) {
	const primaryColor = useColorToken('--accent')

	return (
		<View className='flex-1 p-6'>
			<View className='flex-1 items-center justify-center gap-8'>
				<View className='items-center gap-3'>
					<IconSymbol name='checkmark.circle.fill' size={72} color={primaryColor} />
					<Text className='text-2xl font-bold text-fg-primary'>Session logged!</Text>
				</View>
				<View className='w-full rounded-2xl p-8 items-center gap-1 bg-surface border border-border'>
					<Text className='font-semibold uppercase tracking-widest text-fg-muted'>{categoryName}</Text>
					<Text className='text-[100px] font-extralight text-fg-primary' style={{ fontVariant: ['tabular-nums'] }}>
						{formatDuration(durationSeconds)}
					</Text>
				</View>
			</View>
			<Pressable onPress={onDone} className='p-4 rounded-full items-center bg-accent'>
				<Text className='text-white text-2xl font-semibold'>Done</Text>
			</Pressable>
		</View>
	)
}

const TOTAL_STEPS = 3

function StepDots({ currentStep }: { currentStep: number | null }) {
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
