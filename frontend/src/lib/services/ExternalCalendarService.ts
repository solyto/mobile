import type {
	ExternalAccountError,
	ExternalAccountField,
	ExternalCalendarResponse
} from '$lib/types/calendar';
import type { CalendarRecords, LayoutRecords } from '$lib/types/translation';
import { rateLimitedMessage } from '$lib/helpers/NetworkErrorHelper';

const CODES: Record<string, Omit<ExternalAccountError, 'retryAfter'>> = {
	external_url_not_allowed: { field: 'server_url', reason: 'url_not_allowed' },
	external_server_unreachable: { field: 'server_url', reason: 'server_unreachable' },
	external_no_calendars: { field: 'server_url', reason: 'no_calendars' },
	external_credentials_rejected: { field: 'password', reason: 'credentials_rejected' }
};

const FIELDS: ExternalAccountField[] = ['server_url', 'username', 'password', 'urls'];

export default class ExternalCalendarService {
	errorFromResponse(response: ExternalCalendarResponse<unknown>): ExternalAccountError {
		const errors = response.errors ?? [];
		if (Array.isArray(errors)) {
			const known = CODES[errors[0]];
			return known ? { ...known, retryAfter: null } : { field: null, reason: 'failed', retryAfter: null };
		}

		const field = FIELDS.find((name) => errors[name]?.length) ?? null;
		if (field === null) return { field: null, reason: 'failed', retryAfter: null };

		return { field, reason: field === 'server_url' ? 'url_invalid' : 'failed', retryAfter: null };
	}

	rateLimited(retryAfter: number | null): ExternalAccountError {
		return { field: null, reason: 'rate_limited', retryAfter };
	}

	message(error: ExternalAccountError, calendar: CalendarRecords, layout: LayoutRecords): string {
		switch (error.reason) {
			case 'url_not_allowed':
				return calendar.connect_error_url_not_allowed;
			case 'url_invalid':
				return calendar.connect_error_url_invalid;
			case 'server_unreachable':
				return calendar.connect_error_server_unreachable;
			case 'no_calendars':
				return calendar.connect_error_no_calendars;
			case 'credentials_rejected':
				return calendar.connect_error_credentials_rejected;
			case 'rate_limited':
				return rateLimitedMessage(error.retryAfter, layout);
			default:
				return calendar.connect_error_failed;
		}
	}

	host(serverUrl: string): string {
		try {
			return new URL(serverUrl).host;
		} catch {
			return serverUrl;
		}
	}
}
