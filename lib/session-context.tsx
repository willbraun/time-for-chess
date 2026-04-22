import type { SessionWithCategory } from '@/lib/sessions'
import {
	autoCloseSession as dbAutoCloseSession,
	logPresetSession as dbLogPresetSession,
	startSession as dbStartSession,
	stopSession as dbStopSession,
	stopSessionWithDuration as dbStopSessionWithDuration,
	getActiveSession,
} from '@/lib/sessions'
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'

const REMINDER_THRESHOLD = 7200 // 2 hours — show "session still running" reminder
const AUTO_CLOSE_LIMIT = 10800 // 3 hours — automatically close the session

interface AutoCloseResult {
	duration: number
	categoryName: string
}

interface SessionContextValue {
	activeSession: SessionWithCategory | null
	elapsedSeconds: number
	needsAutoClose: boolean
	isLoading: boolean
	autoCloseResult: AutoCloseResult | null
	startSession: (categoryId: number) => Promise<void>
	stopSession: () => Promise<void>
	stopWithDuration: (durationSeconds: number) => Promise<void>
	logPreset: (categoryId: number, durationSeconds: number) => Promise<void>
	confirmContinue: () => void
	clearAutoCloseResult: () => void
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
	const [autoCloseResult, setAutoCloseResult] = useState<AutoCloseResult | null>(null)
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const refresh = useCallback(async () => {
		const session = await getActiveSession()
		if (session) {
			const now = Math.floor(Date.now() / 1000)
			const elapsed = now - session.start_time
			if (elapsed >= AUTO_CLOSE_LIMIT) {
				await dbAutoCloseSession(session.id, AUTO_CLOSE_LIMIT)
				setAutoCloseResult({ duration: AUTO_CLOSE_LIMIT, categoryName: session.category_name })
				setActiveSession(null)
				setElapsedSeconds(0)
				setNeedsAutoClose(false)
			} else {
				setActiveSession(session)
				setElapsedSeconds(elapsed)
				if (elapsed >= REMINDER_THRESHOLD) {
					setNeedsAutoClose(true)
				}
			}
		} else {
			setActiveSession(null)
			setElapsedSeconds(0)
			setNeedsAutoClose(false)
		}
		setIsLoading(false)
	}, [])

	// Tick elapsed time every second when session is active
	useEffect(() => {
		if (activeSession) {
			intervalRef.current = setInterval(async () => {
				const now = Math.floor(Date.now() / 1000)
				const elapsed = now - activeSession.start_time
				if (elapsed >= AUTO_CLOSE_LIMIT) {
					clearInterval(intervalRef.current!)
					await dbAutoCloseSession(activeSession.id, AUTO_CLOSE_LIMIT)
					setAutoCloseResult({ duration: AUTO_CLOSE_LIMIT, categoryName: activeSession.category_name })
					setActiveSession(null)
					setElapsedSeconds(0)
					setNeedsAutoClose(false)
				} else {
					setElapsedSeconds(elapsed)
					if (elapsed >= REMINDER_THRESHOLD) {
						setNeedsAutoClose(true)
					}
				}
			}, 1000)
		}
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current)
		}
	}, [activeSession])

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

	const stopWithDuration = useCallback(
		async (durationSeconds: number) => {
			if (!activeSession) return
			await dbStopSessionWithDuration(activeSession.id, durationSeconds)
			setActiveSession(null)
			setElapsedSeconds(0)
			setNeedsAutoClose(false)
		},
		[activeSession],
	)

	const logPreset = useCallback(async (categoryId: number, durationSeconds: number) => {
		await dbLogPresetSession(categoryId, durationSeconds)
	}, [])

	const confirmContinue = useCallback(() => {
		setNeedsAutoClose(false)
	}, [])

	const clearAutoCloseResult = useCallback(() => {
		setAutoCloseResult(null)
	}, [])

	return (
		<SessionContext.Provider
			value={{
				activeSession,
				elapsedSeconds,
				needsAutoClose,
				isLoading,
				autoCloseResult,
				startSession,
				stopSession,
				stopWithDuration,
				logPreset,
				confirmContinue,
				clearAutoCloseResult,
				refresh,
			}}
		>
			{children}
		</SessionContext.Provider>
	)
}
