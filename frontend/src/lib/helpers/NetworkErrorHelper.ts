import { NetworkError } from '$lib/services/ApiService';

const NOTIFY_INTERVAL_MS = 5000;

// Callers rarely catch a failed request, so their loadingIndicator.stop() and
// error message never run. This handler for unhandled rejections stops the
// indicator and reports the problem, at most once per burst of failures.
export function createNetworkErrorHandler(
	stopLoading: () => void,
	notify: () => void,
	now: () => number = Date.now
): (event: PromiseRejectionEvent) => void {
	let lastNotifiedAt = -Infinity;

	return (event) => {
		if (!(event.reason instanceof NetworkError)) return;

		event.preventDefault();
		stopLoading();

		if (now() - lastNotifiedAt < NOTIFY_INTERVAL_MS) return;
		lastNotifiedAt = now();
		notify();
	};
}
