import { Redirect, useLocalSearchParams } from 'expo-router'

import { useSession } from '@/lib/session-context'

export default function SessionIndex() {
	const { activeSession, needsAutoClose, isLoading } = useSession()
	const params = useLocalSearchParams<{ category?: string }>()

	if (isLoading) return null

	if (needsAutoClose && activeSession) {
		return <Redirect href='/session/auto-close' />
	}
	if (activeSession) {
		return <Redirect href='/session/active' />
	}
	if (params.category) {
		return <Redirect href={`/session/select?preselect=${params.category}`} />
	}
	return <Redirect href='/session/select' />
}
