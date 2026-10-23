import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionMonitor } from '$lib/state/SessionMonitor';

vi.mock('$app/environment', () => ({ browser: true, dev: true }));

const HOUR = 60 * 60 * 1000;

let fakeDocument: EventTarget & { hidden: boolean };
let fakeWindow: EventTarget;

function setHidden(hidden: boolean): void {
	fakeDocument.hidden = hidden;
	fakeDocument.dispatchEvent(new Event('visibilitychange'));
}

beforeEach(() => {
	vi.useFakeTimers();
	fakeDocument = Object.assign(new EventTarget(), { hidden: false });
	fakeWindow = new EventTarget();
	vi.stubGlobal('document', fakeDocument);
	vi.stubGlobal('window', fakeWindow);
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe('SessionMonitor', () => {
	it('registers visibilitychange and online listeners', () => {
		const documentSpy = vi.spyOn(fakeDocument, 'addEventListener');
		const windowSpy = vi.spyOn(fakeWindow, 'addEventListener');

		new SessionMonitor(vi.fn());

		expect(documentSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
		expect(windowSpy).toHaveBeenCalledWith('online', expect.any(Function));
	});

	it('runs the check on the interval while visible', () => {
		const check = vi.fn();
		new SessionMonitor(check);

		vi.advanceTimersByTime(HOUR);
		expect(check).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(HOUR);
		expect(check).toHaveBeenCalledTimes(2);
	});

	it('does not start the interval while hidden', () => {
		fakeDocument.hidden = true;
		const check = vi.fn();
		new SessionMonitor(check);

		vi.advanceTimersByTime(3 * HOUR);
		expect(check).not.toHaveBeenCalled();
	});

	it('stops the interval when the app is hidden', () => {
		const check = vi.fn();
		new SessionMonitor(check);

		setHidden(true);
		vi.advanceTimersByTime(3 * HOUR);

		expect(check).not.toHaveBeenCalled();
	});

	it('runs the check and restarts the interval when the app becomes visible', () => {
		fakeDocument.hidden = true;
		const check = vi.fn();
		new SessionMonitor(check);

		setHidden(false);
		expect(check).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(HOUR);
		expect(check).toHaveBeenCalledTimes(2);
	});

	it('runs the check when the network comes back', () => {
		const check = vi.fn();
		new SessionMonitor(check);

		fakeWindow.dispatchEvent(new Event('online'));

		expect(check).toHaveBeenCalledTimes(1);
	});

	it('destroy() removes both listeners and clears the interval', () => {
		const check = vi.fn();
		const monitor = new SessionMonitor(check);

		monitor.destroy();
		setHidden(true);
		setHidden(false);
		fakeWindow.dispatchEvent(new Event('online'));
		vi.advanceTimersByTime(3 * HOUR);

		expect(check).not.toHaveBeenCalled();
	});

	it('destroy() is safe to call twice', () => {
		const monitor = new SessionMonitor(vi.fn());

		monitor.destroy();

		expect(() => monitor.destroy()).not.toThrow();
	});
});
