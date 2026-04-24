import { Text } from '@/components/ui/text'
import * as Haptics from 'expo-haptics'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'

import { AppButton } from '@/components/ui/app-button'
import { useSession } from '@/lib/session-context'
import { getCategories, type Category } from '@/lib/sessions'
import { ChevronLeft } from 'lucide-react-native'
import { useColorToken } from '../../../hooks/use-color-token'

const PRESETS = [
	{ label: '15 min', seconds: 15 * 60 },
	{ label: '30 min', seconds: 30 * 60 },
	{ label: '45 min', seconds: 45 * 60 },
	{ label: '60 min', seconds: 60 * 60 },
	{ label: '90 min', seconds: 90 * 60 },
	{ label: '120 min', seconds: 120 * 60 },
]

export default function TimeChoiceScreen() {
	const router = useRouter()
	const { categoryId } = useLocalSearchParams<{ categoryId: string }>()
	const { startSession, logPreset } = useSession()
	const [category, setCategory] = useState<Category | null>(null)
	const mutedColor = useColorToken('--fg-muted')

	useEffect(() => {
		getCategories().then(cats => {
			const cat = cats.find(c => c.id === parseInt(categoryId, 10))
			if (cat) setCategory(cat)
		})
	}, [categoryId])

	const handleStartTimer = async () => {
		if (!category) return
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
		await startSession(category.id)
		router.replace('/session/active' as any)
	}

	const handlePreset = async (seconds: number) => {
		if (!category) return
		await logPreset(category.id, seconds)
		router.replace(`/session/summary?duration=${seconds}&categoryName=${encodeURIComponent(category.name)}` as any)
	}

	if (!category) return null

	return (
		<View className='flex-1 p-6'>
			<View className='flex-1 gap-6'>
				{/* Header */}
				<View className='flex-row items-center gap-3'>
					<Text className='text-3xl font-bold text-fg-primary'>{category.name}</Text>
				</View>

				{/* Preset grid */}
				<View className='gap-3'>
					<Text className='text-sm font-semibold uppercase tracking-widest text-fg-muted mt-4'>
						Log a completed session
					</Text>
					<View className='flex-row gap-2.5 flex-wrap'>
						{PRESETS.map(p => (
							<AppButton
								key={p.seconds}
								variant='surface'
								onPress={() => handlePreset(p.seconds)}
								className='flex-1 min-w-[40%] py-10'
							>
								<Text className='text-2xl font-medium text-fg-primary'>{p.label}</Text>
							</AppButton>
						))}
					</View>
				</View>
				<Pressable onPress={() => router.back()} className='p-1'>
					<View className='flex-row items-center gap-1'>
						<ChevronLeft size={24} color={mutedColor} />
						<Text className='text-sm font-semibold uppercase tracking-widest text-fg-muted'>
							Choose another category
						</Text>
					</View>
				</Pressable>
			</View>

			{/* Start Timer pinned to bottom */}
			<View className='gap-3'>
				<AppButton onPress={handleStartTimer}>
					<Text className='text-accent-foreground text-2xl font-semibold'>Start Timer</Text>
				</AppButton>
			</View>
		</View>
	)
}
