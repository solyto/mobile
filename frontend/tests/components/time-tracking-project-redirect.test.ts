import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setTimeTracking, type TimeTracking } from '$lib/state/TimeTracking.svelte';
import { renderWithContext } from './helpers/context';
import StoreHarness from './helpers/StoreHarness.svelte';
import ProjectPage from '../../src/routes/time-tracking/[id]/+page.svelte';
import { timeTrackingProject } from '../unit/helpers/factories';

const page = vi.hoisted(() => ({ params: { id: '' } }));
const goto = vi.hoisted(() => vi.fn());
vi.mock('$app/state', () => ({ page }));
vi.mock('$app/navigation', () => ({ afterNavigate: (callback: () => void) => callback(), goto }));

function openProject(id: string): void {
	page.params.id = id;
	renderWithContext(StoreHarness, {
		component: ProjectPage,
		provide: setTimeTracking,
		onReady: (tt: TimeTracking) => Object.assign(tt, { loaded: true, projects: [timeTrackingProject({ id: 'p1' })] })
	});
}

beforeEach(() => {
	goto.mockClear();
});

describe('Time-tracking project page', () => {
	it('goes back to the overview for an unknown project', () => {
		openProject('unknown');

		expect(goto).toHaveBeenCalledWith(expect.stringMatching(/\/time-tracking$/));
	});

	it('stays on a known project', () => {
		openProject('p1');

		expect(goto).not.toHaveBeenCalled();
	});
});
