import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'

import { useSession } from '@/lib/session-context'

export default function SessionIndex() {
	const { activeSession, needsAutoClose, isLoading, autoCloseResult, clearAutoCloseResult } = useSession()
	const params = useLocalSearchParams<{ category?: string }>()
	const router = useRouter()

	// Navigate to summary when auto-close fires (e.g. app was backgrounded past 3 hours)
	useEffect(() => {
		if (autoCloseResult) {
			const { duration, categoryName } = autoCloseResult
			clearAutoCloseResult()
			router.replace(`/session/summary?duration=${duration}&categoryName=${encodeURIComponent(categoryName)}` as any)
		}
	}, [autoCloseResult, clearAutoCloseResult, router])

	if (isLoading) return null

	if (needsAutoClose && activeSession) {
		return <Redirect href='/session/session-reminder' />
	}
	if (activeSession) {
		return <Redirect href='/session/active' />
	}
	if (params.category) {
		return <Redirect href={`/session/select?preselect=${params.category}`} />
	}
	return <Redirect href='/session/select' />
}
