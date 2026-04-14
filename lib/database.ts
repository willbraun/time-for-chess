import * as SQLite from 'expo-sqlite'

let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
	if (db) return db
	db = await SQLite.openDatabaseAsync('timeforchess.db')
	await db.execAsync('PRAGMA journal_mode = WAL;')
	await db.execAsync('PRAGMA foreign_keys = ON;')
	await createTables(db)
	await seedCategories(db)
	return db
}

async function createTables(db: SQLite.SQLiteDatabase): Promise<void> {
	await db.execAsync(`
		CREATE TABLE IF NOT EXISTS categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE NOT NULL,
			target_percentage REAL NOT NULL,
			is_active INTEGER NOT NULL DEFAULT 1
		);
	`)
	await db.execAsync(`
		CREATE TABLE IF NOT EXISTS sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			category_id INTEGER NOT NULL,
			start_time INTEGER NOT NULL,
			end_time INTEGER,
			duration_seconds INTEGER,
			status TEXT NOT NULL DEFAULT 'active',
			FOREIGN KEY (category_id) REFERENCES categories(id)
		);
	`)
}

const DEFAULT_CATEGORIES = [
	{ name: 'Playing + Analyzing', target_percentage: 0.33 },
	{ name: 'Tactics / Calculation', target_percentage: 0.33 },
	{ name: 'Openings', target_percentage: 0.11 },
	{ name: 'Endgames', target_percentage: 0.11 },
	{ name: 'Strategy', target_percentage: 0.11 },
]

async function seedCategories(db: SQLite.SQLiteDatabase): Promise<void> {
	const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories')
	if (existing && existing.count > 0) return

	for (const cat of DEFAULT_CATEGORIES) {
		await db.runAsync('INSERT INTO categories (name, target_percentage, is_active) VALUES (?, ?, 1)', [
			cat.name,
			cat.target_percentage,
		])
	}
}
