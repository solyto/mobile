import { DEFAULT_CURRENCY } from '$lib/config/currency';
import type { UserSettings } from '$lib/types/auth';

type MoneySettings = Pick<UserSettings, 'currency' | 'language'>;

export function average(numbers: number[], decimals: number = 2): number {
	const average = numbers.reduce((a, b) => a + b, 0) / numbers.length;

	return Number(average.toFixed(decimals));
}

export function withDecimals(number: number, decimals: number = 2): string {
	return number.toFixed(decimals);
}

export function formatCurrency(
	amount: number,
	currency: string | null | undefined,
	language: string | null | undefined
): string {
	const code = currency && isFormattableCurrency(currency) ? currency : DEFAULT_CURRENCY;
	const locale = language || 'en';

	try {
		return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(amount);
	} catch {
		return new Intl.NumberFormat('en', { style: 'currency', currency: code }).format(amount);
	}
}

export function formatUserMoney(amount: number, settings: MoneySettings | null | undefined): string {
	return formatCurrency(amount, settings?.currency, settings?.language);
}

export function userMoneyFormatKey(settings: MoneySettings | null | undefined): string {
	return `${settings?.currency || DEFAULT_CURRENCY}-${settings?.language || 'en'}`;
}

function isFormattableCurrency(code: string): boolean {
	try {
		new Intl.NumberFormat('en', { style: 'currency', currency: code });
		return true;
	} catch (error) {
		if (error instanceof RangeError) return false;
		throw error;
	}
}

export function formatTimeElapsed(number: number): string {
	if (number < 60) {
		return `${Math.round(number)}s`;
	}

	if (number < 3600) {
		return `${Math.round(Math.floor(number / 60))}m ${Math.round(number % 60)}s`;
	}

	if (number < 86400) {
		return `${Math.round(Math.floor(number / 3600))}h ${Math.round(Math.floor((number % 3600) / 60))}m`;
	}

	return `${Math.round(Math.floor(number / 86400))}d ${Math.round(Math.floor((number % 86400) / 3600))}h`;
}

export function withLeadingZero(number: number): string {
	return number < 10 ? `0${number}` : number.toString();
}

export function humanReadableNumber(number: number): string {
	if (number >= 1000000000) {
		return `${(number / 1000000000).toFixed(1)}B`;
	} else if (number >= 1000000) {
		return `${(number / 1000000).toFixed(1)}M`;
	} else if (number >= 1000) {
		return `${(number / 1000).toFixed(1)}K`;
	} else {
		return number.toString();
	}
}
