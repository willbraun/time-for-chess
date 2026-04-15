import { getDatabase } from './database'

export interface Category {
	id: number
	name: string
	target_percentage: number
	is_active: number
}

export interface Session {
	id: number
	category_id: number
	start_time: number
	end_time: number | null
	duration_seconds: number | null
	status: 'active' | 'completed' | 'auto_closed'
}

export interface SessionWithCategory extends Session {
	category_name: string
}

export async function getCategories(): Promise<Category[]> {
	const db = await getDatabase()
	return db.getAllAsync<Category>('SELECT * FROM categories WHERE is_active = 1 ORDER BY id')
}

export async function startSession(categoryId: number): Promise<number> {
	const db = await getDatabase()
	const now = Math.floor(Date.now() / 1000)
	const result = await db.runAsync('INSERT INTO sessions (category_id, start_time, status) VALUES (?, ?, ?)', [
		categoryId,
		now,
		'active',
	])
	return result.lastInsertRowId
}

export async function stopSession(sessionId: number, endTime?: number): Promise<void> {
	const db = await getDatabase()
	const end = endTime ?? Math.floor(Date.now() / 1000)
	const session = await db.getFirstAsync<Session>('SELECT * FROM sessions WHERE id = ?', [sessionId])
	if (!session) return
	const duration = end - session.start_time
	await db.runAsync('UPDATE sessions SET end_time = ?, duration_seconds = ?, status = ? WHERE id = ?', [
		end,
		duration,
		'completed',
		sessionId,
	])
}

export async function autoCloseSession(sessionId: number, durationSeconds: number): Promise<void> {
	const db = await getDatabase()
	const session = await db.getFirstAsync<Session>('SELECT * FROM sessions WHERE id = ?', [sessionId])
	if (!session) return
	const endTime = session.start_time + durationSeconds
	await db.runAsync('UPDATE sessions SET end_time = ?, duration_seconds = ?, status = ? WHERE id = ?', [
		endTime,
		durationSeconds,
		'auto_closed',
		sessionId,
	])
}

export async function logPresetSession(categoryId: number, durationSeconds: number): Promise<number> {
	const db = await getDatabase()
	const now = Math.floor(Date.now() / 1000)
	const startTime = now - durationSeconds
	const result = await db.runAsync(
		'INSERT INTO sessions (category_id, start_time, end_time, duration_seconds, status) VALUES (?, ?, ?, ?, ?)',
		[categoryId, startTime, now, durationSeconds, 'completed'],
	)
	return result.lastInsertRowId
}

export async function editSessionDuration(sessionId: number, newDurationSeconds: number): Promise<void> {
	const db = await getDatabase()
	const session = await db.getFirstAsync<Session>('SELECT * FROM sessions WHERE id = ?', [sessionId])
	if (!session) return
	const newEndTime = session.start_time + newDurationSeconds
	await db.runAsync('UPDATE sessions SET end_time = ?, duration_seconds = ? WHERE id = ?', [
		newEndTime,
		newDurationSeconds,
		sessionId,
	])
}

export async function getActiveSession(): Promise<SessionWithCategory | null> {
	const db = await getDatabase()
	return db.getFirstAsync<SessionWithCategory>(
		`SELECT s.*, c.name as category_name
		 FROM sessions s
		 JOIN categories c ON s.category_id = c.id
		 WHERE s.status = 'active'
		 ORDER BY s.start_time DESC
		 LIMIT 1`,
	)
}

export async function getCategoryTotals(days: number = 30): Promise<{ category_id: number; total_seconds: number }[]> {
	const db = await getDatabase()
	const cutoff = Math.floor(Date.now() / 1000) - days * 86400
	return db.getAllAsync<{ category_id: number; total_seconds: number }>(
		`SELECT category_id, COALESCE(SUM(duration_seconds), 0) as total_seconds
		 FROM sessions
		 WHERE status IN ('completed', 'auto_closed')
		   AND start_time >= ?
		 GROUP BY category_id`,
		[cutoff],
	)
}

export async function getRecentSessions(days: number = 30): Promise<SessionWithCategory[]> {
	const db = await getDatabase()
	const cutoff = Math.floor(Date.now() / 1000) - days * 86400
	return db.getAllAsync<SessionWithCategory>(
		`SELECT s.*, c.name as category_name
		 FROM sessions s
		 JOIN categories c ON s.category_id = c.id
		 WHERE s.status IN ('completed', 'auto_closed')
		   AND s.start_time >= ?
		 ORDER BY s.start_time DESC`,
		[cutoff],
	)
}

export async function deleteSession(sessionId: number): Promise<void> {
	const db = await getDatabase()
	await db.runAsync('DELETE FROM sessions WHERE id = ?', [sessionId])
}
