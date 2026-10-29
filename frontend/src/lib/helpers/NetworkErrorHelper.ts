import { NetworkError, RateLimitedError } from '$lib/services/ApiService';
import type { LayoutRecords, SettingsRecords } from '$lib/types/translation';

const NOTIFY_INTERVAL_MS = 5000;

// Callers rarely catch a failed request, so their loadingIndicator.stop() and
// error message never run. This handler for unhandled rejections stops the
// indicator and reports the problem, at most once per burst of failures.
export function createNetworkErrorHandler(
	stopLoading: () => void,
	notifyNetworkError: () => void,
	notifyRateLimited: (error: RateLimitedError) => void,
	now: () => number = Date.now
): (event: PromiseRejectionEvent) => void {
	let lastNotifiedAt = -Infinity;

	return (event) => {
		const reason = event.reason;
		if (!(reason instanceof NetworkError) && !(reason instanceof RateLimitedError)) return;

		event.preventDefault();
		stopLoading();

		if (now() - lastNotifiedAt < NOTIFY_INTERVAL_MS) return;
		lastNotifiedAt = now();

		if (reason instanceof RateLimitedError) {
			notifyRateLimited(reason);
		} else {
			notifyNetworkError();
		}
	};
}

export function rateLimitedMessage(retryAfter: number | null, layout: LayoutRecords): string {
	if (retryAfter === null) return layout.rate_limited;

	const minutes = waitInUnits(retryAfter, 60);
	return minutes === 1
		? layout.rate_limited_minutes_singular
		: layout.rate_limited_minutes_plural.replace('{n}', String(minutes));
}

export function exportRateLimitedMessage(retryAfter: number | null, settings: SettingsRecords): string {
	if (retryAfter === null) return settings.export_rate_limited;

	const hours = waitInUnits(retryAfter, 3600);
	return hours === 1
		? settings.export_rate_limited_hours_singular
		: settings.export_rate_limited_hours_plural.replace('{n}', String(hours));
}

// Rounded up so the user never retries too early.
function waitInUnits(seconds: number, unitSeconds: number): number {
	return Math.max(1, Math.ceil(seconds / unitSeconds));
}
