import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { getCategories, type Category } from '@/lib/sessions'

export default function SelectScreen() {
	const router = useRouter()
	const { back, preselect } = useLocalSearchParams<{ back?: string; preselect?: string }>()
	const [categories, setCategories] = useState<Category[]>([])
	const hasPushed = useRef(false)

	useEffect(() => {
		getCategories().then(setCategories)
	}, [])

	useEffect(() => {
		if (preselect && !hasPushed.current) {
			hasPushed.current = true
			router.push(`/session/time-choice?categoryId=${preselect}` as any)
		}
	}, [preselect, router])

	return (
		<View className='flex-1 gap-4 p-6'>
			<Stack.Screen options={{ animation: preselect ? 'none' : back ? 'slide_from_left' : undefined }} />
			<Text className='text-3xl font-bold text-fg-primary'>Choose a category</Text>
			<View className='gap-3 mt-4'>
				{categories.map(cat => (
					<Pressable
						key={cat.id}
						onPress={() => router.push(`/session/time-choice?categoryId=${cat.id}` as any)}
						className='py-4.5 px-5 rounded-xl bg-secondary'
					>
						<Text className='text-2xl font-semibold text-center text-white'>{cat.name}</Text>
					</Pressable>
				))}
			</View>
		</View>
	)
}
