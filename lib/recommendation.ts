import type { Category } from './sessions'

export interface CategoryDistribution {
	category_id: number
	name: string
	target: number
	actual: number
	total_seconds: number
	bandLow: number
	bandHigh: number
	score: number
}

export interface Recommendation {
	category: CategoryDistribution
	score: number
}

// Band width constant used to compute the range around the target percentage
// Lower is more strict / narrower band around the target percentage
const BAND_K = 0.2

export function calculateDistribution(
	categories: Category[],
	totals: { category_id: number; total_seconds: number }[],
): CategoryDistribution[] {
	const totalsMap = new Map(totals.map(t => [t.category_id, t.total_seconds]))
	const grandTotal = totals.reduce((sum, t) => sum + t.total_seconds, 0)

	return categories.map(cat => {
		const seconds = totalsMap.get(cat.id) ?? 0
		const actual = grandTotal > 0 ? seconds / grandTotal : 0
		const target = cat.target_percentage
		const bandWidth = BAND_K * Math.sqrt(target * (1 - target))
		const bandLow = Math.max(0, target - bandWidth / 2)
		const bandHigh = Math.min(1, target + bandWidth / 2)

		return {
			category_id: cat.id,
			name: cat.name,
			target,
			actual,
			total_seconds: seconds,
			bandLow,
			bandHigh,
			score: actual >= bandLow ? 0 : Math.sqrt(target - actual),
		}
	})
}

export function getRecommendation(distribution: CategoryDistribution[]): Recommendation | null {
	let best: Recommendation | null = null

	for (const cat of distribution) {
		if (cat.actual >= cat.bandLow) {
			continue
		}

		const gap = cat.target - cat.actual
		const score = Math.sqrt(Math.abs(gap))
		if (!best || score > best.score) {
			best = { category: cat, score }
		}
	}

	return best
}
