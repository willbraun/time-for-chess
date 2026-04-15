import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

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
		<View className='flex-1 bg-app-bg'>
			{/* Handle bar */}
			<View className='items-center pt-2 pb-1'>
				<View className='w-9 h-1.25 rounded opacity-30 bg-app-icon' />
			</View>

			{step === 'select' && <SelectStep categories={categories} onSelect={handleSelectCategory} />}
			{step === 'time-choice' && selectedCategory && (
				<TimeChoiceStep
					category={selectedCategory}
					onStartTimer={handleStartTimer}
					onPreset={handlePreset}
					onBack={() => setStep('select')}
				/>
			)}
			{step === 'active' && activeSession && (
				<ActiveStep categoryName={activeSession.category_name} elapsedSeconds={elapsedSeconds} onStop={handleStop} />
			)}
			{step === 'auto-close' && activeSession && (
				<AutoCloseStep
					categoryName={activeSession.category_name}
					onContinue={handleAutoCloseContinue}
					onStop={handleAutoCloseStop}
				/>
			)}
			{step === 'summary' && (
				<SummaryStep
					categoryName={selectedCategory?.name ?? activeSession?.category_name ?? ''}
					durationSeconds={completedDuration}
					onDone={handleDone}
				/>
			)}
		</View>
	)
}

function SelectStep({ categories, onSelect }: { categories: Category[]; onSelect: (cat: Category) => void }) {
	return (
		<View className='flex-1 gap-4 p-6'>
			<Text className='text-2xl font-bold text-app-text'>Choose a category</Text>
			<View className='gap-3 mt-4'>
				{categories.map(cat => (
					<Pressable key={cat.id} onPress={() => onSelect(cat)} className='py-4.5 px-5 rounded-xl bg-app-secondary'>
						<Text className='text-[17px] font-semibold text-center text-white'>{cat.name}</Text>
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
		<View className='flex-1 gap-4 p-6'>
			<Pressable onPress={onBack}>
				<Text className='text-base mb-4 text-app-primary'>← Back</Text>
			</Pressable>
			<Text className='text-2xl font-bold text-app-text'>{category.name}</Text>
			<Text className='text-base mb-6 text-app-icon'>How do you want to log time?</Text>

			<Pressable onPress={onStartTimer} className='py-4 rounded-xl items-center px-4 bg-app-primary'>
				<Text className='text-white text-[17px] font-semibold'>Start Timer</Text>
			</Pressable>

			<Text className='text-center mb-4 text-sm text-app-icon'>or log a completed session</Text>

			<View className='flex-row gap-2.5 flex-wrap'>
				{PRESETS.map(p => (
					<Pressable
						key={p.seconds}
						onPress={() => onPreset(p.seconds)}
						className='flex-1 min-w-[40%] py-3.5 rounded-[10px] border border-app-border items-center bg-app-surface'
					>
						<Text className='text-[15px] font-medium text-app-text'>{p.label}</Text>
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
}: {
	categoryName: string
	elapsedSeconds: number
	onStop: () => void
}) {
	return (
		<View className='flex-1 gap-4 p-6 items-center justify-center'>
			<Text className='text-xl font-semibold mb-4 text-app-icon'>{categoryName}</Text>
			<Text className='text-[64px] font-extralight text-app-text mb-12' style={{ fontVariant: ['tabular-nums'] }}>
				{formatDuration(elapsedSeconds)}
			</Text>
			<Pressable onPress={onStop} className='w-25 h-25 rounded-full items-center justify-center bg-app-primary'>
				<Text className='text-white text-lg font-bold'>Stop</Text>
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
			<Text className='text-2xl font-bold text-app-text'>Session still open</Text>
			<Text className='text-base mb-6 text-app-icon'>
				Your {categoryName} session has been running for over an hour.
			</Text>

			<Pressable onPress={onContinue} className='py-4 rounded-xl items-center px-4 bg-app-primary'>
				<Text className='text-white text-[17px] font-semibold'>Continue Session</Text>
			</Pressable>

			<Text className='text-center mb-4 text-sm text-app-icon'>or stop and estimate your time</Text>

			<View className='flex-row gap-2.5 flex-wrap'>
				{PRESETS.map(p => (
					<Pressable
						key={p.seconds}
						onPress={() => onStop(p.seconds)}
						className='flex-1 min-w-[40%] py-3.5 rounded-[10px] border border-app-border items-center bg-app-surface'
					>
						<Text className='text-[15px] font-medium text-app-text'>{p.label}</Text>
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
	return (
		<View className='flex-1 gap-4 p-6 items-center justify-center'>
			<Text className='text-2xl font-bold text-app-text'>Session logged</Text>
			<View className='py-6 px-8 rounded-2xl items-center bg-app-primary'>
				<Text className='text-white text-lg font-semibold mb-1'>{categoryName}</Text>
				<Text className='text-white text-[36px] font-light' style={{ fontVariant: ['tabular-nums'] }}>
					{formatDuration(durationSeconds)}
				</Text>
			</View>
			<Pressable onPress={onDone} className='py-4 rounded-xl items-center px-4 bg-app-primary self-stretch'>
				<Text className='text-white text-[17px] font-semibold'>Done</Text>
			</Pressable>
		</View>
	)
}
