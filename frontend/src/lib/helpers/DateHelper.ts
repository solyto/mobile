import type { CalendarDay } from '$lib/types/calendar';
import type { WeekStart } from '$lib/types/auth';

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

export function parseDateSlug(slug: string): Date | null {
	const parts = slug.split('.');
	if (parts.length !== 3) return null;
	return localDateFromParts(parts[2], parts[1], parts[0]);
}

// `new Date('YYYY-mm-dd')` would read the value as UTC midnight.
export function parseUrlFormat(value: string): Date | null {
	const parts = value.split('-');
	if (parts.length !== 3) return null;
	return localDateFromParts(parts[0], parts[1], parts[2]);
}

function localDateFromParts(yearPart: string, monthPart: string, dayPart: string): Date | null {
	const year = parseInt(yearPart, 10);
	const month = parseInt(monthPart, 10);
	const day = parseInt(dayPart, 10);
	if (!day || !month || !year) return null;
	return new Date(year, month - 1, day);
}

export function formatFloatingDate(date: Date) {
	const pad = (n: number) => String(n).padStart(2, '0');

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function floatingToUtc(floating: string, timeZone: string): Date {
	const [year, month, day, hours, minutes, seconds] = floating.split(/[-T:]/).map(Number);
	const wallClock = Date.UTC(year, month - 1, day, hours, minutes, seconds);
	// The offset is read twice: the first guess can land on the other side of a DST change.
	const guess = wallClock - offsetInTimeZone(wallClock, timeZone);

	return new Date(wallClock - offsetInTimeZone(guess, timeZone));
}

export function dateInTimeZone(instant: Date, timeZone: string): string {
	return new Date(wallClockInTimeZone(instant.getTime(), timeZone)).toISOString().slice(0, 10);
}

function offsetInTimeZone(timestamp: number, timeZone: string): number {
	return wallClockInTimeZone(timestamp, timeZone) - timestamp;
}

function wallClockInTimeZone(timestamp: number, timeZone: string): number {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	}).formatToParts(new Date(timestamp));
	const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);

	return Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second'));
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function formatDateWithoutYear(
	input: string | Date,
	dateFormat: string | null = null
): string {
	const date = (typeof input === 'string' && DATE_ONLY.test(input) ? parseUrlFormat(input) : null) ?? new Date(input),
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

export function formatMonth(input: string | Date, dateFormat: string | null = null): string {
	const monthFormat = (dateFormat ?? 'dd.mm.YYYY').replace(/^dd[^a-zA-Z]|[^a-zA-Z]dd$|(?<=[^a-zA-Z])dd[^a-zA-Z]/, '');
	return formatDate(input, monthFormat);
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

export function getStartOfMonthMonthsAgo(date: Date, months: number): Date {
	const start = new Date(date);
	start.setMonth(start.getMonth() - months, 1);

	return start;
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

export function getDaysInMonth(year: number, month: number): Date[] {
	const days: Date[] = [];
	const count = new Date(year, month + 1, 0).getDate();
	for (let d = 1; d <= count; d++) {
		days.push(new Date(year, month, d));
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
		const newDate = new Date();
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

export function getStartOfWeek(date: Date, weekStart: WeekStart): Date {
	const daysSinceStart = weekStart === 'sunday' ? date.getDay() : (date.getDay() + 6) % 7;

	return new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysSinceStart);
}

export function isDateThisWeek(date: Date, weekStart: WeekStart): boolean {
	const startOfWeek = getStartOfWeek(new Date(), weekStart);
	const startOfNextWeek = getDatePlusDays(startOfWeek, 7);

	return date >= startOfWeek && date < startOfNextWeek;
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

// Rounded, so a 23- or 25-hour day across a daylight saving change still counts as one.
export function getDateDiffInDays(date1: Date, date2: Date): number {
	const diffInMs = date2.getTime() - date1.getTime();
	return Math.round(diffInMs / (1000 * 60 * 60 * 24));
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

export function getISOWeeksInYear(isoYear: number): number {
	return getWeekNumber(new Date(isoYear, 11, 28));
}

export function getCalendarMonth(year?: number, month?: number, weekStart: WeekStart = 'monday'): CalendarDay[] {
	const now = new Date();
	const targetYear = year ?? now.getFullYear();
	const targetMonth = month ?? now.getMonth();

	const startDate = getStartOfWeek(new Date(targetYear, targetMonth, 1), weekStart);

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

// Only the weeks that hold a day of the month, so a month spans four to six rows.
export function getCalendarWeeks(year: number, month: number, weekStart: WeekStart): CalendarDay[][] {
	const days = getCalendarMonth(year, month, weekStart);
	const weeks: CalendarDay[][] = [];
	for (let i = 0; i < days.length; i += 7) {
		const week = days.slice(i, i + 7);
		if (week.some((day) => !day.is_grayed_out)) weeks.push(week);
	}
	return weeks;
}

export function getCalendarWeek(startOfWeek: Date): CalendarDay[] {
	const days: CalendarDay[] = [];

	for (let i = 0; i < 7; i++) {
		const date = new Date(startOfWeek);
		date.setDate(startOfWeek.getDate() + i);

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

export function getWeekNumberOfWeek(startOfWeek: Date): number {
	// Week numbers stay ISO: a Sunday week takes the number of its Monday, its second day.
	return getWeekNumber(getNextDay(startOfWeek));
}

export function getWeekdayOrder(weekStart: WeekStart): number[] {
	return weekStart === 'sunday' ? [7, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7];
}

export function getHoursOfDay(): string[] {
	return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
}

export function isOffHour(hour: string): boolean {
	return parseInt(hour) < 6 || parseInt(hour) >= 22;
}

export function getMobileHourHeightRem(hour: string): number {
	return isOffHour(hour) ? 1.5 : 3.5;
}

export function getMobileHourRows(): string {
	return getHoursOfDay()
		.map((hour) => `${getMobileHourHeightRem(hour)}rem`)
		.join(' ');
}

// Rows differ in height, so the rows up to `hourOfDay` (16.5 = 16:30, 24 = end of day) are added up.
export function getMobileTimeOffsetRem(hourOfDay: number): number {
	const hours = getHoursOfDay();
	const fullHours = Math.min(Math.floor(hourOfDay), 24);
	let offset = 0;

	for (let i = 0; i < fullHours; i++) {
		offset += getMobileHourHeightRem(hours[i]);
	}

	if (fullHours < 24) {
		offset += (hourOfDay - fullHours) * getMobileHourHeightRem(hours[fullHours]);
	}

	return offset;
}

// The days after `start`, up to and including the first one that reaches `end`.
export function eachDayBetween(start: Date, end: Date): Date[] {
	const days: Date[] = [];
	const current = new Date(start);

	while (current < end) {
		current.setDate(current.getDate() + 1);
		days.push(new Date(current));
	}

	return days;
}
