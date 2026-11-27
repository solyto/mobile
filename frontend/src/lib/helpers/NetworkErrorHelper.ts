import { NetworkError, RateLimitedError } from '$lib/services/ApiService';
import type { ClipboardRecords, LayoutRecords, SettingsRecords } from '$lib/types/translation';
import { pluralize } from '$lib/helpers/FormatHelper';

const NOTIFY_INTERVAL_MS = 5000;

// Callers rarely catch a failed request, so their loadingIndicator.stop() and error message never run;
// this handler for unhandled rejections does both, at most once per burst of failures.
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

	return pluralize(waitInUnits(retryAfter, 60), layout.rate_limited_minutes_singular, layout.rate_limited_minutes_plural);
}

export function exportRateLimitedMessage(retryAfter: number | null, settings: SettingsRecords): string {
	return waitInHoursMessage(
		retryAfter,
		settings.export_rate_limited,
		settings.export_rate_limited_hours_singular,
		settings.export_rate_limited_hours_plural
	);
}

export function clipboardFileLimitMessage(retryAfter: number | null, clipboard: ClipboardRecords): string {
	return waitInHoursMessage(
		retryAfter,
		clipboard.file_limit_reached,
		clipboard.file_limit_reached_hours_singular,
		clipboard.file_limit_reached_hours_plural
	);
}

function waitInHoursMessage(retryAfter: number | null, plain: string, singular: string, plural: string): string {
	if (retryAfter === null) return plain;

	return pluralize(waitInUnits(retryAfter, 3600), singular, plural);
}

// Rounded up so the user never retries too early.
function waitInUnits(seconds: number, unitSeconds: number): number {
	return Math.max(1, Math.ceil(seconds / unitSeconds));
}
