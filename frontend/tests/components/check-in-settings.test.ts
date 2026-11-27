import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import CheckInSettings from '$lib/components/check-in/CheckInSettings.svelte';
import type { CheckInTracker } from '$lib/types/check_in';
import { renderWithContext } from './helpers/context';
import CheckInContextHarness from './helpers/CheckInContextHarness.svelte';
import { checkInTracker } from '../unit/helpers/factories';

const mood = checkInTracker({ id: 1, key: 'mood', name: null, type: 'scale', scored: true });
const sports = checkInTracker({ id: 2, key: 'sports', name: null, type: 'sport', position: 1 });
const meditated = checkInTracker({ id: 3, position: 2 });

function renderSettings(trackers: CheckInTracker[], startWithNewTracker = false) {
	return renderWithContext(CheckInContextHarness, { component: CheckInSettings, props: { onClose: vi.fn(), startWithNewTracker }, trackers });
}

function dividers(container: HTMLElement): NodeListOf<Element> {
	return container.querySelectorAll('div[aria-hidden="true"].border-dashed');
}

describe('Check-in settings', () => {
	it('is titled by what it shows', async () => {
		renderSettings([mood, sports, meditated]);
		expect(screen.getByText('Settings')).toBeInTheDocument();

		await fireEvent.click(screen.getAllByRole('button', { name: 'Edit tracker' })[1]);
		expect(screen.getByText('Edit tracker')).toBeInTheDocument();
	});

	it('is titled "Add tracker" when it opens on a new tracker', () => {
		renderSettings([mood], true);
		expect(screen.getAllByText('Add tracker').length).toBeGreaterThan(0);
		expect(screen.queryByText('Settings')).not.toBeInTheDocument();
	});

	it('offers editing for own trackers and Sports only, Sports opening the sports choice', async () => {
		renderSettings([mood, sports, meditated]);
		const edits = screen.getAllByRole('button', { name: 'Edit tracker' });
		expect(edits).toHaveLength(2);

		await fireEvent.click(edits[0]);
		expect(screen.getByRole('button', { name: 'Sports' })).toBeInTheDocument();
	});

	it('draws a line between ratings and logs only when both are there', () => {
		expect(dividers(renderSettings([mood, meditated]).container)).toHaveLength(1);
	});

	it('draws no line with ratings only', () => {
		expect(dividers(renderSettings([mood, sports]).container)).toHaveLength(0);
	});

	it('draws no line with logs only', () => {
		expect(dividers(renderSettings([meditated]).container)).toHaveLength(0);
	});

	it('switches a tracker back on when turning it off fails', async () => {
		const put = vi.spyOn(ApiService.prototype, 'put').mockResolvedValue(false);
		renderSettings([sports, meditated]);

		await fireEvent.click(screen.getAllByRole('checkbox')[1]);

		await waitFor(() => expect(put).toHaveBeenCalled());
		await waitFor(() => expect(screen.getAllByRole('checkbox')[1]).toBeChecked());
	});

	it('keeps a tracker off when turning it off is saved', async () => {
		vi.spyOn(ApiService.prototype, 'put').mockResolvedValue(true);
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [sports, { ...meditated, enabled: false }] } as never);
		renderSettings([sports, meditated]);

		await fireEvent.click(screen.getAllByRole('checkbox')[1]);

		await waitFor(() => expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked());
	});

	it('ticks "scored" again when unticking it fails', async () => {
		const put = vi.spyOn(ApiService.prototype, 'put').mockResolvedValue(false);
		renderSettings([mood, meditated]);

		await fireEvent.click(screen.getAllByRole('checkbox')[0]);

		await waitFor(() => expect(put).toHaveBeenCalled());
		await waitFor(() => expect(screen.getAllByRole('checkbox')[0]).toBeChecked());
	});
});
