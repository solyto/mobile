import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';

const chart = vi.hoisted(() => ({
	setOption: vi.fn(),
	clear: vi.fn(),
	resize: vi.fn(),
	dispose: vi.fn()
}));

vi.mock('$lib/components/charts/echarts', () => ({ init: () => chart }));

const values = [
	{ value: 10, name: 'Savings' },
	{ value: 20, name: 'Cash', color: '#123456' }
];

function lastSelected(): Record<string, boolean> {
	return (chart.setOption.mock.calls.at(-1)?.[0] as { legend: { selected: Record<string, boolean> } }).legend.selected;
}

function swatchColor(name: string): string {
	return (screen.getByRole('button', { name }).querySelector('span') as HTMLElement).style.backgroundColor;
}

describe('DoughnutChart legend', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('lists every entry with its palette or own colour', () => {
		render(DoughnutChart, { values });

		expect(swatchColor('Savings')).toBe('rgb(80, 112, 221)');
		expect(swatchColor('Cash')).toBe('rgb(18, 52, 86)');
	});

	it('toggles the slice and the pressed state on click', async () => {
		render(DoughnutChart, { values });
		const button = screen.getByRole('button', { name: 'Cash' });

		await userEvent.click(button);
		expect(lastSelected()).toEqual({ Savings: true, Cash: false });
		expect(button.getAttribute('aria-pressed')).toBe('false');

		await userEvent.click(button);
		expect(lastSelected()).toEqual({ Savings: true, Cash: true });
		expect(button.getAttribute('aria-pressed')).toBe('true');
	});

	it('renders no legend without values', () => {
		render(DoughnutChart, { values: [] });

		expect(screen.queryByRole('button')).toBeNull();
	});

	it('clears the chart when the values become empty', async () => {
		const { rerender } = render(DoughnutChart, { values });
		await waitFor(() => expect(chart.setOption).toHaveBeenCalled());

		await rerender({ values: [] });

		await waitFor(() => expect(chart.clear).toHaveBeenCalled());
	});

	it('keeps the hidden slices when the chart is updated', async () => {
		const { rerender } = render(DoughnutChart, {
			values,
			centerFormatter: () => 'first',
			valueFormatter: () => 'first'
		});
		await waitFor(() => expect(chart.setOption).toHaveBeenCalled());
		await userEvent.click(screen.getByRole('button', { name: 'Cash' }));
		const callsBeforeChange = chart.setOption.mock.calls.length;

		await rerender({
			values,
			centerFormatter: () => 'second',
			valueFormatter: () => 'second'
		});

		await waitFor(() => expect(chart.setOption.mock.calls.length).toBeGreaterThan(callsBeforeChange));
		expect(lastSelected()).toEqual({ Savings: true, Cash: false });
	});

	it('updates the chart when its values change', async () => {
		const { rerender } = render(DoughnutChart, { values });
		await waitFor(() => expect(chart.setOption).toHaveBeenCalled());
		const callsBeforeChange = chart.setOption.mock.calls.length;

		await rerender({ values: [{ value: 5, name: 'Coding' }, { value: 3, name: 'Meetings' }] });

		await waitFor(() => expect(chart.setOption.mock.calls.length).toBeGreaterThan(callsBeforeChange));
		const lastOptions = chart.setOption.mock.calls.at(-1)?.[0] as { series: { data: { name: string; value: number }[] }[] };
		expect(lastOptions.series[0].data.map((slice) => [slice.name, slice.value])).toEqual([['Coding', 5], ['Meetings', 3]]);
	});

	it('disposes the chart when it is removed', async () => {
		const { unmount } = render(DoughnutChart, { values });
		await waitFor(() => expect(chart.setOption).toHaveBeenCalled());

		unmount();

		expect(chart.dispose).toHaveBeenCalled();
	});

	it('updates the chart when the formatter changes', async () => {
		const { rerender } = render(DoughnutChart, {
			values,
			centerFormatter: () => 'first',
			valueFormatter: () => 'first'
		});
		await waitFor(() => expect(chart.setOption).toHaveBeenCalled());
		const callsBeforeChange = chart.setOption.mock.calls.length;

		await rerender({
			values,
			centerFormatter: () => 'second',
			valueFormatter: () => 'second'
		});

		await waitFor(() => expect(chart.setOption.mock.calls.length).toBeGreaterThan(callsBeforeChange));
		const lastOptions = chart.setOption.mock.calls.at(-1)?.[0] as { title: { text: string }[] };
		expect(lastOptions.title[1].text).toBe('second');
	});
});
