import { describe, it, expect } from 'vitest';
import ExternalCalendarService from '$lib/services/ExternalCalendarService';
import { en } from '$lib/i18n/en';

const service = new ExternalCalendarService();

function refused(code: string) {
	return { success: false, message: 'Refused.', errors: [code] };
}

function invalid(field: string, message: string) {
	return { success: false, message: 'The given data was invalid.', errors: { [field]: [message] } };
}

describe('ExternalCalendarService', () => {
	describe('errorFromResponse', () => {
		it.each([
			['external_url_not_allowed', 'server_url', 'url_not_allowed'],
			['external_server_unreachable', 'server_url', 'server_unreachable'],
			['external_no_calendars', 'server_url', 'no_calendars'],
			['external_credentials_rejected', 'password', 'credentials_rejected']
		])('maps the code %s to the %s field', (code, field, reason) => {
			expect(service.errorFromResponse(refused(code))).toEqual({ field, reason, retryAfter: null });
		});

		it('reports an unknown code as a general failure', () => {
			expect(service.errorFromResponse(refused('something_new'))).toEqual({ field: null, reason: 'failed', retryAfter: null });
		});

		it('treats a server URL validation error as an invalid URL', () => {
			expect(service.errorFromResponse(invalid('server_url', 'The server url field must be a valid URL.'))).toEqual({
				field: 'server_url',
				reason: 'url_invalid',
				retryAfter: null
			});
		});

		it('keeps the field of other validation errors', () => {
			expect(service.errorFromResponse(invalid('username', 'The username field is required.'))).toEqual({
				field: 'username',
				reason: 'failed',
				retryAfter: null
			});
		});

		it('reports an error without codes or field errors as a general failure', () => {
			expect(service.errorFromResponse({ success: false, message: 'ExternalCalendarAccount not found.' })).toEqual({
				field: null,
				reason: 'failed',
				retryAfter: null
			});
		});
	});

	describe('message', () => {
		it('names the reason', () => {
			const error = { field: 'password' as const, reason: 'credentials_rejected' as const, retryAfter: null };
			expect(service.message(error, en.calendar, en.layout)).toBe(en.calendar.connect_error_credentials_rejected);
		});

		it('tells how long to wait when rate limited', () => {
			expect(service.message(service.rateLimited(90), en.calendar, en.layout)).toBe('Too many attempts. Please try again in 2 minutes.');
			expect(service.message(service.rateLimited(null), en.calendar, en.layout)).toBe(en.layout.rate_limited);
		});
	});

	describe('host', () => {
		it('shows the host of the server URL', () => {
			expect(service.host('https://cloud.example.com:8443/remote.php/dav')).toBe('cloud.example.com:8443');
		});

		it('keeps a value that is not a URL', () => {
			expect(service.host('not a url')).toBe('not a url');
		});
	});
});
