import type { SessionWithCategory } from '@/lib/sessions'
import {
	autoCloseSession as dbAutoCloseSession,
	logPresetSession as dbLogPresetSession,
	startSession as dbStartSession,
	stopSession as dbStopSession,
	getActiveSession,
} from '@/lib/sessions'
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'

const AUTO_CLOSE_THRESHOLD = 60 * 60 // 60 minutes in seconds

interface SessionContextValue {
	activeSession: SessionWithCategory | null
	elapsedSeconds: number
	needsAutoClose: boolean
	isLoading: boolean
	startSession: (categoryId: number) => Promise<void>
	stopSession: () => Promise<void>
	logPreset: (categoryId: number, durationSeconds: number) => Promise<void>
	confirmContinue: () => void
	confirmStop: (durationSeconds: number) => Promise<void>
	refresh: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession() {
	const ctx = useContext(SessionContext)
	if (!ctx) throw new Error('useSession must be used within SessionProvider')
	return ctx
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const [activeSession, setActiveSession] = useState<SessionWithCategory | null>(null)
	const [elapsedSeconds, setElapsedSeconds] = useState(0)
	const [needsAutoClose, setNeedsAutoClose] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const refresh = useCallback(async () => {
		const session = await getActiveSession()
		setActiveSession(session)
		if (session) {
			const now = Math.floor(Date.now() / 1000)
			const elapsed = now - session.start_time
			setElapsedSeconds(elapsed)
			if (elapsed > AUTO_CLOSE_THRESHOLD) {
				setNeedsAutoClose(true)
			}
		} else {
			setElapsedSeconds(0)
			setNeedsAutoClose(false)
		}
		setIsLoading(false)
	}, [])

	// Tick elapsed time every second when session is active
	useEffect(() => {
		if (activeSession && !needsAutoClose) {
			intervalRef.current = setInterval(() => {
				const now = Math.floor(Date.now() / 1000)
				setElapsedSeconds(now - activeSession.start_time)
			}, 1000)
		}
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current)
		}
	}, [activeSession, needsAutoClose])

	// Check on app resume
	useEffect(() => {
		const sub = AppState.addEventListener('change', state => {
			if (state === 'active') refresh()
		})
		return () => sub.remove()
	}, [refresh])

	// Initial load
	useEffect(() => {
		refresh()
	}, [refresh])

	const startSession = useCallback(
		async (categoryId: number) => {
			await dbStartSession(categoryId)
			await refresh()
		},
		[refresh],
	)

	const stopSession = useCallback(async () => {
		if (!activeSession) return
		await dbStopSession(activeSession.id)
		setActiveSession(null)
		setElapsedSeconds(0)
		setNeedsAutoClose(false)
	}, [activeSession])

	const logPreset = useCallback(async (categoryId: number, durationSeconds: number) => {
		await dbLogPresetSession(categoryId, durationSeconds)
	}, [])

	const confirmContinue = useCallback(() => {
		setNeedsAutoClose(false)
	}, [])

	const confirmStop = useCallback(
		async (durationSeconds: number) => {
			if (!activeSession) return
			await dbAutoCloseSession(activeSession.id, durationSeconds)
			setActiveSession(null)
			setElapsedSeconds(0)
			setNeedsAutoClose(false)
		},
		[activeSession],
	)

	return (
		<SessionContext.Provider
			value={{
				activeSession,
				elapsedSeconds,
				needsAutoClose,
				isLoading,
				startSession,
				stopSession,
				logPreset,
				confirmContinue,
				confirmStop,
				refresh,
			}}
		>
			{children}
		</SessionContext.Provider>
	)
}
