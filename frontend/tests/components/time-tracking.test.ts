import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import type { Component } from 'svelte';
import { setTimeTracking, type TimeTracking } from '$lib/state/TimeTracking.svelte';
import type { Translation } from '$lib/state/Translation.svelte';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import ProjectCreate from '$lib/components/time-tracking/ProjectCreate.svelte';
import TimerWidget from '$lib/components/time-tracking/TimerWidget.svelte';
import GroupedEntries from '$lib/components/time-tracking/GroupedEntries.svelte';
import TimeTrackingNavigation from '$lib/components/time-tracking/TimeTrackingNavigation.svelte';
import DashboardView from '$lib/components/time-tracking/DashboardView.svelte';
import StatisticsView from '$lib/components/time-tracking/StatisticsView.svelte';
import EntryCreate from '$lib/components/time-tracking/EntryCreate.svelte';
import TimeTrackingWidget from '$lib/components/dashboard/widgets/TimeTrackingWidget.svelte';
import { renderWithContext } from './helpers/context';
import { rejectionsDuring } from './helpers/rejections';
import StoreHarness from './helpers/StoreHarness.svelte';
import { timeTrackingCategory, timeTrackingEntry, timeTrackingProject } from '../unit/helpers/factories';

vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/time-tracking?tab=entries'), params: {} } }));

const writing = timeTrackingProject({ id: 'p1', title: 'Writing', color: '#ff0000' });
const reading = timeTrackingProject({ id: 'p2', title: 'Reading', color: '#0000ff' });

// Wednesday 2026-10-14, noon UTC
const NOW = new Date('2026-10-14T12:00:00.000Z');

const entries = [
	timeTrackingEntry({ id: 'today', project: writing, started_at: '2026-10-14T08:00:00.000Z', duration_minutes: 90 }),
	timeTrackingEntry({ id: 'monday', project: reading, started_at: '2026-10-12T08:00:00.000Z', duration_minutes: 30 }),
	timeTrackingEntry({ id: 'last-week', project: reading, started_at: '2026-10-05T08:00:00.000Z', duration_minutes: 600 })
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderTimeTracking(component: Component<any>, props: Record<string, unknown> = {}, seed: (tt: TimeTracking) => void = () => {}): TimeTracking {
	let store: TimeTracking | null = null;
	renderWithContext(StoreHarness, {
		component,
		props,
		provide: setTimeTracking,
		onReady: (tt: TimeTracking) => {
			Object.assign(tt, { loaded: true, projects: [writing, reading], entries });
			seed(tt);
			store = tt;
		}
	}, { onReady: (stores) => (loadingIndicator = stores.loadingIndicator as LoadingIndicator) });
	return store!;
}

let loadingIndicator: LoadingIndicator;

async function save(): Promise<void> {
	await fireEvent.click(screen.getByRole('button', { name: 'Save' }));
}

function widgetTexts(heading: string): string {
	return screen.getByText(heading).closest('div.rounded-lg')!.textContent!.replace(/\s+/g, ' ').trim();
}

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(NOW);
});

afterEach(() => {
	vi.useRealTimers();
});

describe('Time tracking dashboard', () => {
	it("breaks down today's and this week's time by project, largest first", () => {
		renderTimeTracking(DashboardView, { weekStart: 'monday' });

		expect(widgetTexts('Today')).toBe('Today Total Time 1h 30m Writing 1h 30m');
		expect(widgetTexts('This Week')).toBe('This Week Total Time 2h 0m Writing 1h 30m Reading 30m');
	});

	it('draws each bar as the share of the total in the project colour', () => {
		renderTimeTracking(DashboardView, { weekStart: 'monday' });

		const bars = [...screen.getByText('This Week').closest('div.rounded-lg')!.querySelectorAll<HTMLElement>('div.h-1.rounded-full > div')];
		expect(bars.map((bar) => bar.style.width)).toEqual(['75%', '25%']);
		expect(bars.map((bar) => bar.style.backgroundColor)).toEqual(['rgb(255, 0, 0)', 'rgb(0, 0, 255)']);
	});

	it('shows the empty text when nothing was tracked today', () => {
		renderTimeTracking(DashboardView, { weekStart: 'monday' }, (tt) => (tt.entries = [entries[2]]));

		expect(widgetTexts('Today')).toBe('Today Total Time 0m No entries yet.');
	});
});

describe('Time tracking dashboard widget', () => {
	function renderWidget(): void {
		renderWithContext(StoreHarness, {}, {
			prepare: (stores) => ({
				component: TimeTrackingWidget,
				provide: setTimeTracking,
				props: { ts: stores.ts as Translation, weekStart: 'monday' },
				onReady: (tt: TimeTracking) => Object.assign(tt, { loaded: true, projects: [writing, reading], entries })
			})
		});
	}

	it("shows this week's projects with their share of the week", () => {
		renderWidget();

		const widget = screen.getByText('This Week').closest('div.flex-col')!.parentElement!;
		expect(widget.textContent!.replace(/\s+/g, ' ').trim()).toBe('Time tracking This Week 2h 0m Writing 1h 30m Reading 30m');
		const bars = [...widget.querySelectorAll<HTMLElement>('div.h-1.rounded-full > div')];
		expect(bars.map((bar) => bar.style.width)).toEqual(['75%', '25%']);
	});
});

describe('Time tracking statistics', () => {
	const red = timeTrackingCategory({ id: 3, title: 'Red', color: '#ff0000' });
	const plain = timeTrackingCategory({ id: 7, title: 'Plain', color: null });

	it('loads the statistics for the selected categories and highlights them in their colour', async () => {
		const tt = renderTimeTracking(StatisticsView, {}, (store) => {
			store.categories = [red, plain];
			vi.spyOn(store, 'loadStatistics').mockResolvedValue();
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Red' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Plain' }));

		expect(tt.loadStatistics).toHaveBeenLastCalledWith(expect.any(String), expect.any(String), [3, 7]);
		expect(screen.getByRole('button', { name: 'Red' }).getAttribute('style')).toBe('background-color: rgb(255, 0, 0); border-color: rgb(255, 0, 0); color: rgb(255, 255, 255);');
		expect(screen.getByRole('button', { name: 'Plain' }).getAttribute('style')).toContain('background-color: var(--color-c-primary); border-color: var(--color-c-primary);');

		await fireEvent.click(screen.getByRole('button', { name: 'All' }));

		expect(tt.loadStatistics).toHaveBeenLastCalledWith(expect.any(String), expect.any(String), []);
		expect(screen.getByRole('button', { name: 'Red' }).getAttribute('style') ?? '').not.toContain('background-color');
	});
});

describe('Time tracking entry form', () => {
	function renderForm(props: Record<string, unknown> = {}): TimeTracking {
		const tt = renderTimeTracking(EntryCreate, { onClose: vi.fn(), ...props });
		vi.spyOn(tt, 'createEntry').mockResolvedValue(true);
		vi.spyOn(tt, 'updateEntry').mockResolvedValue(true);
		return tt;
	}

	function field(selector: string): HTMLInputElement {
		return document.querySelector<HTMLInputElement>(selector)!;
	}

	it('anchors a duration-only entry at local noon of the chosen day', async () => {
		const tt = renderForm();
		const [project, unit] = screen.getAllByRole('combobox') as HTMLSelectElement[];

		await fireEvent.change(project, { target: { value: 'p2' } });
		await fireEvent.input(screen.getByRole('spinbutton'), { target: { value: '1.5' } });
		await fireEvent.change(unit, { target: { value: 'hours' } });
		await fireEvent.input(field('input[type=date]'), { target: { value: '2026-10-03' } });
		await save();

		expect(tt.createEntry).toHaveBeenCalledWith({
			description: null,
			started_at: '2026-10-03T12:00:00.000Z',
			stopped_at: '2026-10-03T13:30:00.000Z',
			duration_minutes: 90,
			has_exact_times: false,
			project_id: 'p2'
		});
	});

	it('takes the duration from exact start and stop times', async () => {
		const tt = renderForm({ projectId: 'p1' });

		await fireEvent.click(screen.getByRole('button', { name: /Started/ }));
		const [start, stop] = document.querySelectorAll<HTMLInputElement>('input[type=datetime-local]');
		await fireEvent.input(start, { target: { value: '2026-10-03T09:15' } });
		await fireEvent.input(stop, { target: { value: '2026-10-03T10:00' } });
		await save();

		expect(tt.createEntry).toHaveBeenCalledWith(expect.objectContaining({
			started_at: '2026-10-03T09:15:00.000Z',
			stopped_at: '2026-10-03T10:00:00.000Z',
			duration_minutes: 45,
			has_exact_times: true,
			project_id: 'p1'
		}));
	});

	it('shows whole hours in hours and saves an edited entry unchanged', async () => {
		const entry = timeTrackingEntry({ id: 'e9', project: writing, description: 'Draft', duration_minutes: 120, started_at: '2026-10-02T12:00:00.000Z' });
		const tt = renderForm({ entry });

		expect((screen.getAllByRole('combobox')[1] as HTMLSelectElement).value).toBe('hours');
		expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('2');
		await save();

		expect(tt.updateEntry).toHaveBeenCalledWith('e9', {
			description: 'Draft',
			started_at: '2026-10-02T12:00:00.000Z',
			stopped_at: '2026-10-02T14:00:00.000Z',
			duration_minutes: 120,
			has_exact_times: false,
			project_id: 'p1'
		});
	});

	it('keeps an odd number of minutes in minutes', () => {
		renderForm({ entry: timeTrackingEntry({ project: writing, duration_minutes: 90 }) });

		expect((screen.getAllByRole('combobox')[1] as HTMLSelectElement).value).toBe('minutes');
		expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('90');
	});

	it('stops the loading indicator even when saving throws', async () => {
		const tt = renderForm({ projectId: 'p1' });
		vi.mocked(tt.createEntry).mockRejectedValue(new Error('offline'));
		await fireEvent.input(screen.getByRole('spinbutton'), { target: { value: '5' } });

		const rejections = await rejectionsDuring(save);

		expect(rejections).toEqual([new Error('offline')]);
		expect(loadingIndicator.active).toBe(false);
	});
});

describe('Time tracking navigation', () => {
	function renderNavigation(seed: (tt: TimeTracking) => void = () => {}): TimeTracking {
		return renderTimeTracking(TimeTrackingNavigation, { onCreateProject: vi.fn(), onEditProject: vi.fn() }, seed);
	}

	it('links the three tabs and marks the open one', () => {
		renderNavigation();

		const links = screen.getAllByRole('link', { name: /^(Dashboard|Entries|Statistics)$/ }).slice(0, 3);
		expect(links.map((link) => link.getAttribute('href'))).toEqual(['/time-tracking', '/time-tracking?tab=entries', '/time-tracking?tab=statistics']);
		expect(links.map((link) => link.classList.contains('bg-c-neutral-1'))).toEqual([false, true, false]);
	});

	it('adds a category and stops the loading indicator even when that throws', async () => {
		const tt = renderNavigation((store) => {
			store.createCategory = vi.fn().mockRejectedValue(new Error('offline'));
		});

		await fireEvent.click(screen.getAllByRole('button', { name: 'Add Category' })[0]);
		const input = screen.getAllByPlaceholderText('Title')[0];
		await fireEvent.input(input, { target: { value: ' Deep work ' } });

		const rejections = await rejectionsDuring(() => fireEvent.click(input.closest('div.flex-row')!.querySelector('button')!).then(() => {}));

		expect(tt.createCategory).toHaveBeenCalledWith({ title: 'Deep work' });
		expect(rejections).toEqual([new Error('offline')]);
		expect(loadingIndicator.active).toBe(false);
	});

	it('edits and deletes a project from its row', async () => {
		const onEditProject = vi.fn();
		let store: TimeTracking | null = null;
		renderWithContext(StoreHarness, {
			component: TimeTrackingNavigation,
			provide: setTimeTracking,
			props: { onCreateProject: vi.fn(), onEditProject },
			onReady: (tt: TimeTracking) => {
				Object.assign(tt, { loaded: true, projects: [writing], entries: [] });
				tt.deleteProject = vi.fn().mockResolvedValue(true);
				store = tt;
			}
		});

		await fireEvent.click(screen.getAllByRole('button', { name: 'Edit Project' })[0]);
		expect(onEditProject).toHaveBeenCalledWith('p1');

		await fireEvent.click(screen.getAllByRole('button', { name: 'Delete Project' })[0]);
		await fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
		expect(store!.deleteProject).toHaveBeenCalledWith('p1');
	});
});

describe('Time tracking entries', () => {
	it('groups finished entries by day with the day total', () => {
		renderTimeTracking(GroupedEntries, {}, (tt) => {
			tt.entries = [
				timeTrackingEntry({ id: 'running', project: writing, started_at: '2026-10-14T11:00:00.000Z', stopped_at: null, duration_minutes: 0 }),
				...entries,
				timeTrackingEntry({ id: 'monday-2', project: writing, started_at: '2026-10-12T15:00:00.000Z', duration_minutes: 45 })
			];
		});

		const days = [...document.querySelectorAll('.text-base.font-medium')].map((day) => day.parentElement!.textContent!.replace(/\s+/g, ' ').trim());
		expect(days).toHaveLength(3);
		expect(days[0]).toMatch(/14.* 1h 30m$/);
		expect(days[1]).toMatch(/12.* 1h 15m$/);
		expect(days[2]).toMatch(/05.* 10h 0m$/);
	});
});

describe('Time tracking project form', () => {
	it('saves a new project and stops the loading indicator even when that throws', async () => {
		const tt = renderTimeTracking(ProjectCreate, { onClose: vi.fn() }, (store) => {
			store.createProject = vi.fn().mockRejectedValue(new Error('offline'));
		});

		await fireEvent.input(screen.getAllByPlaceholderText('Title')[0], { target: { value: ' Book ' } });
		await fireEvent.input(screen.getAllByPlaceholderText('Description')[0], { target: { value: '  ' } });
		const rejections = await rejectionsDuring(save);

		expect(tt.createProject).toHaveBeenCalledWith({ title: 'Book', description: null, category_ids: [] });
		expect(rejections).toEqual([new Error('offline')]);
		expect(loadingIndicator.active).toBe(false);
	});

	it('updates an existing project with its categories', async () => {
		const onClose = vi.fn();
		const tt = renderTimeTracking(ProjectCreate, { onClose, projectId: 'p1' }, (store) => {
			store.projects = [timeTrackingProject({ id: 'p1', title: 'Writing', description: 'Words', categories: [timeTrackingCategory({ id: 4 })] })];
			store.updateProject = vi.fn().mockResolvedValue(true);
		});

		await save();

		expect(tt.updateProject).toHaveBeenCalledWith('p1', { title: 'Writing', description: 'Words', category_ids: [4] });
		expect(onClose).toHaveBeenCalled();
	});
});

describe('Time tracking timer', () => {
	it('starts a timer for the chosen project and stops the loading indicator even when that throws', async () => {
		const tt = renderTimeTracking(TimerWidget, {}, (store) => {
			store.startTimer = vi.fn().mockRejectedValue(new Error('offline'));
		});

		await fireEvent.change(screen.getByRole('combobox'), { target: { value: 'p2' } });
		await fireEvent.input(screen.getByPlaceholderText('Description'), { target: { value: ' Chapter 3 ' } });
		const rejections = await rejectionsDuring(() => fireEvent.click(screen.getAllByRole('button', { name: 'Start Timer' })[0]).then(() => {}));

		expect(tt.startTimer).toHaveBeenCalledWith({ project_id: 'p2', description: 'Chapter 3' });
		expect(rejections).toEqual([new Error('offline')]);
		expect(loadingIndicator.active).toBe(false);
	});

	it('shows how long the running timer has been going', () => {
		renderTimeTracking(TimerWidget, {}, (store) => {
			store.activeTimer = timeTrackingEntry({ started_at: '2026-10-14T10:58:55.000Z', stopped_at: null, project: writing });
		});

		expect(screen.getByText('01:01:05')).toBeTruthy();
	});
});
