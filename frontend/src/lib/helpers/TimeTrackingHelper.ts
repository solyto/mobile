export type DurationUnit = 'minutes' | 'hours';

export type TimeTrackingTab = 'dashboard' | 'entries' | 'statistics';

const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = 60_000;
const DURATION_ONLY_ANCHOR_HOUR = 12;

export function timeTrackingTab(url: URL): TimeTrackingTab {
	const tab = url.searchParams.get('tab');
	if (tab === 'entries' || tab === 'statistics') return tab;
	return 'dashboard';
}

export function formatDuration(minutes: number): string {
	const hours = Math.floor(minutes / MINUTES_PER_HOUR);
	const rest = minutes % MINUTES_PER_HOUR;
	if (hours === 0) return `${rest}m`;
	return `${hours}h ${rest}m`;
}

export function splitDuration(minutes: number): { amount: number; unit: DurationUnit } {
	if (minutes >= MINUTES_PER_HOUR && minutes % MINUTES_PER_HOUR === 0) {
		return { amount: minutes / MINUTES_PER_HOUR, unit: 'hours' };
	}
	return { amount: minutes, unit: 'minutes' };
}

export function durationInMinutes(amount: number, unit: DurationUnit): number {
	return Math.round(unit === 'hours' ? amount * MINUTES_PER_HOUR : amount);
}

export function minutesBetween(start: string, stop: string): number {
	const ms = new Date(stop).getTime() - new Date(start).getTime();
	return ms > 0 ? Math.round(ms / MS_PER_MINUTE) : 0;
}

// Anchored at local noon so the entry never rolls into the previous calendar day.
export function durationOnlyTimestamps(date: string, minutes: number): { started_at: string; stopped_at: string } {
	const [y, m, d] = date.split('-').map(Number);
	const start = new Date(y, m - 1, d, DURATION_ONLY_ANCHOR_HOUR, 0, 0, 0);
	const stop = new Date(start.getTime() + minutes * MS_PER_MINUTE);
	return { started_at: start.toISOString(), stopped_at: stop.toISOString() };
}

export function toDateTimeInputValue(iso: string): string {
	const date = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatElapsed(totalSeconds: number): string {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}
