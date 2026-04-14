import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DistributionBar } from '@/components/distribution-bar'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import {
	calculateDistribution,
	getRecommendation,
	type CategoryDistribution,
	type Recommendation,
} from '@/lib/recommendation'
import { getCategories, getCategoryTotals } from '@/lib/sessions'

export default function HomeScreen() {
	const router = useRouter()
	const colorScheme = useColorScheme() ?? 'light'
	const colors = Colors[colorScheme]
	const insets = useSafeAreaInsets()

	const [distribution, setDistribution] = useState<CategoryDistribution[]>([])
	const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
	const [hasData, setHasData] = useState(false)

	useFocusEffect(
		useCallback(() => {
			async function load() {
				const [categories, totals] = await Promise.all([getCategories(), getCategoryTotals(30)])
				const dist = calculateDistribution(categories, totals)
				setDistribution(dist)
				setRecommendation(getRecommendation(dist))
				setHasData(totals.length > 0)
			}
			load()
		}, []),
	)

	const handleRecommendationPress = () => {
		if (recommendation) {
			router.push({
				pathname: '/session',
				params: { category: String(recommendation.category.category_id) },
			} as any)
		} else {
			router.push('/session' as any)
		}
	}

	return (
		<ScrollView
			style={[styles.scroll, { backgroundColor: colors.background }]}
			contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
		>
			<Text style={[styles.title, { color: colors.text }]}>Time for Chess</Text>

			{/* Recommendation card */}
			<Pressable onPress={handleRecommendationPress}>
				{hasData && recommendation ? (
					<View style={[styles.recCard, { backgroundColor: colors.accent }]}>
						<Text style={styles.recLabel}>Recommended</Text>
						<Text style={styles.recCategory}>{recommendation.category.name}</Text>
						<Text style={styles.recHint}>Tap to start a session</Text>
					</View>
				) : hasData ? (
					<View style={[styles.recCard, { backgroundColor: colors.primary }]}>
						<Text style={styles.recCategory}>You&apos;re balanced!</Text>
						<Text style={styles.recHint}>Tap to start any session</Text>
					</View>
				) : (
					<View style={[styles.recCard, { backgroundColor: colors.secondary }]}>
						<Text style={styles.recCategory}>Get started</Text>
						<Text style={styles.recHint}>Log your first session to see recommendations</Text>
					</View>
				)}
			</Pressable>

			{/* Distribution bars */}
			{hasData && (
				<View style={styles.barsSection}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>30-Day Distribution</Text>
					{distribution.map(d => (
						<DistributionBar key={d.category_id} data={d} />
					))}
				</View>
			)}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	scroll: {
		flex: 1,
	},
	content: {
		padding: 20,
		paddingBottom: 32,
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		marginBottom: 20,
	},
	recCard: {
		borderRadius: 16,
		padding: 24,
		marginBottom: 24,
	},
	recLabel: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 13,
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 4,
	},
	recCategory: {
		color: '#FFFFFF',
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 4,
	},
	recHint: {
		color: 'rgba(255,255,255,0.8)',
		fontSize: 14,
	},
	barsSection: {
		marginTop: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 16,
	},
})
