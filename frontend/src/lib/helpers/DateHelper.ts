import type { CalendarDay } from '$lib/types/nextcloud_calendar';
import { SvelteDate } from 'svelte/reactivity';

export function formatDateTime(
	input: string | Date,
	dateFormat: string | null = null,
	timeFormat: string | null = null
): string {
	return `${formatDate(input, dateFormat)} ${formatTime(input, timeFormat)}`;
}

export function formatDate(input: string | Date, dateFormat: string | null = null): string {
	const date = new Date(input),
		day = String(date.getDate()).padStart(2, '0'),
		month = String(date.getMonth() + 1).padStart(2, '0'),
		year = date.getFullYear();

	if (dateFormat) {
		return dateFormat
			.replace('dd', day)
			.replace('mm', month)
			.replace('YYYY', year.toString())
			.replace('YY', year.toString().slice(-2));
	}

	return `${day}.${month}.${year}`;
}

export function formatFloatingDate(date: Date) {
	const pad = (n: number) => String(n).padStart(2, '0');

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatDateWithoutYear(
	input: string | Date,
	dateFormat: string | null = null
): string {
	const date = new Date(input),
		day = String(date.getDate()).padStart(2, '0'),
		month = String(date.getMonth() + 1).padStart(2, '0');

	if (dateFormat) {
		return dateFormat
			.replace('dd', day)
			.replace('mm', month)
			.replace('YYYY', '')
			.replace('YY', '')
			.replace(/^\//, '') // Leading slash
			.replace(/^\./, '') // Leading dot
			.replace(/^-/, '') // Leading dash
			.replace(/\/$/, '') // Trailing slash
			.replace(/\.$/, '') // Trailing dot
			.replace(/-$/, '') // Trailing dash
			.replace('  ', ' ') // Double spaces
			.trim();
	}

	return `${day}.${month}`;
}

export function formatTime(input: string | Date, timeFormat: string | null = null): string {
	const date = typeof input === 'string' ? new Date(input) : input,
		hours = date.getHours(),
		minutes = date.getMinutes(),
		hour = String(hours),
		hourPadded = String(hours).padStart(2, '0'),
		minute = String(minutes).padStart(2, '0');

	if (timeFormat === 'g:i A') {
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const hour12 = hours % 12 || 12;
		return `${hour12}:${minute} ${ampm}`;
	}

	if (timeFormat === 'g:i a') {
		const ampm = hours >= 12 ? 'pm' : 'am';
		const hour12 = hours % 12 || 12;
		return `${hour12}:${minute} ${ampm}`;
	}

	if (timeFormat) {
		return timeFormat.replace('HH', hourPadded).replace('H', hour).replace('i', minute);
	}

	return `${hour}:${minute}`;
}

export function formatDateWithWeekday(
	input: string | Date,
	dateFormat: string | null = null,
	locale: string | undefined = undefined
): string {
	const date = new Date(input),
		weekday = date.toLocaleDateString(locale, { weekday: 'long' });

	return `${weekday}, ${formatDate(input, dateFormat)}`;
}

export function formatTimeWithSeconds(
	input: string | Date,
	timeFormat: string | null = null
): string {
	const date = typeof input === 'string' ? new Date(input) : input,
		hours = date.getHours(),
		minutes = date.getMinutes(),
		seconds = date.getSeconds(),
		hour = String(hours),
		hourPadded = String(hours).padStart(2, '0'),
		minute = String(minutes).padStart(2, '0'),
		second = String(seconds).padStart(2, '0');

	if (timeFormat === 'g:i A') {
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const hour12 = hours % 12 || 12;
		return `${hour12}:${minute}:${second} ${ampm}`;
	}

	if (timeFormat === 'g:i a') {
		const ampm = hours >= 12 ? 'pm' : 'am';
		const hour12 = hours % 12 || 12;
		return `${hour12}:${minute}:${second} ${ampm}`;
	}

	if (timeFormat) {
		return (
			timeFormat.replace('HH', hourPadded).replace('H', hour).replace('i', minute) +
			`:${second}`
		);
	}

	return `${hourPadded}:${minute}:${second}`;
}

export function getUrlFormat(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0'),
		month = String(date.getMonth() + 1).padStart(2, '0'),
		year = date.getFullYear();

	return `${year}-${month}-${day}`;
}

export function getDateMinusDays(date: Date, days: number): Date {
	const dateMinusDays = new Date(date);
	dateMinusDays.setDate(dateMinusDays.getDate() - days);

	return dateMinusDays;
}

export function getDatePlusDays(date: Date, days: number): Date {
	const datePlusDays = new Date(date);
	datePlusDays.setDate(datePlusDays.getDate() + days);

	return datePlusDays;
}

export function getNextDay(date: Date): Date {
	return getDatePlusDays(date, 1);
}

export function getPrevDay(date: Date): Date {
	return getDateMinusDays(date, 1);
}

export function getDaysInMonth(year: number, month: number): SvelteDate[] {
	const days: SvelteDate[] = [];
	const count = new SvelteDate(year, month + 1, 0).getDate();
	for (let d = 1; d <= count; d++) {
		days.push(new SvelteDate(year, month, d));
	}
	return days;
}

export function getLast30Days(): Date[] {
	const dates: Date[] = [];
	const today = new Date();

	dates.push(today);

	for (let i = 1; i < 30; i++) {
		const newDate = new Date();
		newDate.setDate(today.getDate() - i);
		dates.push(newDate);
	}

	return dates;
}

export function getNextXDays(x: number): Date[] {
	const dates: Date[] = [];
	const today = new Date();

	dates.push(today);

	for (let i = 1; i < x; i++) {
		const newDate = new SvelteDate();
		newDate.setDate(today.getDate() + i);
		dates.push(newDate);
	}

	return dates;
}

export function isDateToday(date: Date): boolean {
	const today = new Date();
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
}

export function isDateTomorrow(date: Date): boolean {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return (
		date.getDate() === tomorrow.getDate() &&
		date.getMonth() === tomorrow.getMonth() &&
		date.getFullYear() === tomorrow.getFullYear()
	);
}

export function isDateYesterday(date: Date): boolean {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() - 1);
	return (
		date.getDate() === tomorrow.getDate() &&
		date.getMonth() === tomorrow.getMonth() &&
		date.getFullYear() === tomorrow.getFullYear()
	);
}

export function isDateThisWeek(date: Date): boolean {
	const today = new Date();
	const dayOfWeek = today.getDay();
	const startOfWeek = new Date(today);
	startOfWeek.setDate(today.getDate() - dayOfWeek);
	startOfWeek.setHours(0, 0, 0, 0);
	const endOfWeek = new Date(startOfWeek);
	endOfWeek.setDate(startOfWeek.getDate() + 6);
	endOfWeek.setHours(23, 59, 59, 999);
	return date >= startOfWeek && date <= endOfWeek;
}

export function isDateLast7Days(date: Date): boolean {
	const today = new Date();
	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(today.getDate() - 7);
	return date >= sevenDaysAgo && date <= today;
}

export function isDateInThePast(date: Date): boolean {
	const today = new Date();
	return date < today;
}

export function isDateInTheFuture(date: Date): boolean {
	const today = new Date();
	return date > today;
}

export function isDateAfter(date: Date, compareDate: Date): boolean {
	return date > compareDate;
}

export function daysSince(date: string | Date): number {
	if (!(date instanceof Date)) date = new Date(date);

	return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function dateFromTimestamp(timestamp: number): Date {
	return new Date(timestamp * 1000);
}

export function getDateDiffInMinutes(date1: Date, date2: Date): number {
	const diffInMs = date2.getTime() - date1.getTime();
	return Math.floor(diffInMs / (1000 * 60));
}

export function getDateDiffInDays(date1: Date, date2: Date): number {
	const diffInMs = date2.getTime() - date1.getTime();
	return Math.trunc(diffInMs / (1000 * 60 * 60 * 24));
}

export function getCurrentTimestamp(): number {
	return Math.floor(new Date().getTime() / 1000);
}

export function getCurrentYearMonthString(): string {
	const today = new Date();
	return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

export function getWeekNumber(date: Date): number {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getISOWeek(date: Date): { week: number; year: number } {
	const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const day = tmp.getUTCDay() || 7;
	tmp.setUTCDate(tmp.getUTCDate() + 4 - day);

	const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

	return { week, year: tmp.getUTCFullYear() };
}

interface ISODateInfo {
	year: number; // ISO year
	month: number; // 1–12
	week: number; // ISO week number (1–53)
}

export function getISODateInfo(date: Date): ISODateInfo {
	const tmpDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

	// ISO week day (Mon=1 ... Sun=7)
	const dayOfWeek = tmpDate.getUTCDay() || 7;

	// Thursday of this week is used to determine the ISO year
	tmpDate.setUTCDate(tmpDate.getUTCDate() + 4 - dayOfWeek);
	const isoYear = tmpDate.getUTCFullYear();

	// ISO week number
	const yearStart = new Date(Date.UTC(isoYear, 0, 1));
	const weekNumber = Math.ceil(((tmpDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

	return {
		year: isoYear,
		month: date.getMonth() + 1, // 1–12
		week: weekNumber
	};
}

export function getCalendarMonth(year?: number, month?: number): CalendarDay[] {
	const now = new Date();
	const targetYear = year ?? now.getFullYear();
	const targetMonth = month ?? now.getMonth();

	const firstOfMonth = new Date(targetYear, targetMonth, 1);
	const startWeekday = (firstOfMonth.getDay() || 7) - 1; // Monday = 0
	const startDate = new Date(targetYear, targetMonth, 1 - startWeekday);

	const days: CalendarDay[] = [];

	for (let i = 0; i < 42; i++) {
		const date = new Date(startDate);
		date.setDate(startDate.getDate() + i);

		days.push({
			number: date.getDate(),
			weekday: date.getDay() || 7,
			date,
			entries: [],
			is_grayed_out: date.getMonth() !== targetMonth
		});
	}

	return days;
}

export function getCalendarWeek(year: number, week: number): CalendarDay[] {
	const days: CalendarDay[] = [];

	const simple = new Date(year, 0, 1 + (week - 1) * 7);
	const dayOfWeek = simple.getDay();
	const isoThursday = new Date(simple);
	isoThursday.setDate(simple.getDate() + (4 - (dayOfWeek === 0 ? 7 : dayOfWeek)));

	const weekStart = new Date(isoThursday);
	weekStart.setDate(isoThursday.getDate() - 3);

	for (let i = 0; i < 7; i++) {
		const date = new Date(weekStart);
		date.setDate(weekStart.getDate() + i);

		days.push({
			number: date.getDate(),
			weekday: date.getDay() || 7,
			date,
			entries: [],
			is_grayed_out: false
		});
	}

	return days;
}
