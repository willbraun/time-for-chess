export function formatDuration(seconds: number): string {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	if (h > 0) {
		return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
	}
	return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDurationMinutes(seconds: number): string {
	const minutes = Math.round(seconds / 60)
	if (minutes < 60) return `${minutes}m`
	const h = Math.floor(minutes / 60)
	const m = minutes % 60
	return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatDate(unixTimestamp: number): string {
	const date = new Date(unixTimestamp * 1000)
	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	})
}

export function formatTime(unixTimestamp: number): string {
	const date = new Date(unixTimestamp * 1000)
	return date.toLocaleTimeString(undefined, {
		hour: 'numeric',
		minute: '2-digit',
	})
}
