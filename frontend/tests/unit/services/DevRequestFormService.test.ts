import { describe, it, expect } from 'vitest';
import DevRequestFormService from '$lib/services/DevRequestFormService';
import { devRequest } from '../helpers/factories';

const service = new DevRequestFormService();

describe('fromEntry', () => {
	it('prefills the editable fields from the entry', () => {
		const form = service.fromEntry(devRequest({ type: 'feature', priority: 4, status: 'completed', fixed_in_version: '1.2.3' }));

		expect(form).toMatchObject({
			title: 'Login fails',
			description: 'The login button does nothing',
			type: 'feature',
			priority: '4',
			status: 'completed',
			fixed_in_version: { major: 1, minor: 2, patch: 3 }
		});
	});

	it('falls back to low priority and an empty version', () => {
		const form = service.fromEntry(devRequest({ priority: null }));

		expect(form.priority).toBe('1');
		expect(form.fixed_in_version).toEqual({ major: null, minor: null, patch: null });
	});
});

describe('changes', () => {
	it('is empty when nothing was changed', () => {
		const entry = devRequest({ status: 'completed', fixed_in_version: '1.2.3' });
		expect(service.changes(entry, service.fromEntry(entry))).toEqual({});
	});

	it('does not set a priority on an entry that has none unless it was changed', () => {
		const entry = devRequest({ priority: null });
		expect(service.changes(entry, service.fromEntry(entry))).toEqual({});
		expect(service.changes(entry, { ...service.fromEntry(entry), priority: '3' })).toEqual({ priority: 3 });
	});

	it('sends only the changed fields', () => {
		const entry = devRequest();
		const form = { ...service.fromEntry(entry), title: 'Login broken', type: 'feature', priority: '5', status: 'in-progress' };

		expect(service.changes(entry, form)).toEqual({ title: 'Login broken', type: 'feature', priority: 5, status: 'in-progress' });
	});

	it('sets the fixed-in version when completing a request', () => {
		const entry = devRequest();
		const form = { ...service.fromEntry(entry), status: 'completed', fixed_in_version: { major: 1, minor: 2, patch: 0 } };

		expect(service.changes(entry, form)).toEqual({ status: 'completed', fixed_in_version: '1.2.0' });
	});

	it('changes the version of an already completed request', () => {
		const entry = devRequest({ status: 'completed', fixed_in_version: '1.2.0' });
		const form = { ...service.fromEntry(entry), fixed_in_version: { major: 1, minor: 2, patch: 1 } };

		expect(service.changes(entry, form)).toEqual({ fixed_in_version: '1.2.1' });
	});

	it('clears the version when all parts are emptied', () => {
		const entry = devRequest({ status: 'completed', fixed_in_version: '1.2.0' });
		const form = { ...service.fromEntry(entry), fixed_in_version: { major: null, minor: null, patch: null } };

		expect(service.changes(entry, form)).toEqual({ fixed_in_version: null });
	});

	it('clears the version when the status leaves completed', () => {
		const entry = devRequest({ status: 'completed', fixed_in_version: '1.2.0' });
		const form = { ...service.fromEntry(entry), status: 'cancelled' };

		expect(service.changes(entry, form)).toEqual({ status: 'cancelled', fixed_in_version: null });
	});

	it('ignores a version typed into a request that is not completed', () => {
		const entry = devRequest();
		const form = { ...service.fromEntry(entry), fixed_in_version: { major: 1, minor: 0, patch: 0 } };

		expect(service.changes(entry, form)).toEqual({});
	});

	it('does not send a clear when the entry has no version and the API omits the field', () => {
		const entry = devRequest({ fixed_in_version: undefined as unknown as null });
		expect(service.changes(entry, service.fromEntry(entry))).toEqual({});
	});
});
