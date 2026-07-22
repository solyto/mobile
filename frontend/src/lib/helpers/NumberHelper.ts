export function average(numbers: number[], decimals: number = 2): number {
	const average = numbers.reduce((a, b) => a + b, 0) / numbers.length;

	return Number(average.toFixed(decimals));
}

export function withDecimals(number: number, decimals: number = 2): string {
	return number.toFixed(decimals);
}

export function europeanFormat(number: number): string {
	return number.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
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
