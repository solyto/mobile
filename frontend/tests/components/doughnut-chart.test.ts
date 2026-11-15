import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';

const chart = vi.hoisted(() => ({
	setOption: vi.fn(),
	dispatchAction: vi.fn(),
	resize: vi.fn(),
	dispose: vi.fn()
}));

vi.mock('$lib/components/charts/echarts', () => ({ init: () => chart }));

const values = [
	{ value: 10, name: 'Savings' },
	{ value: 20, name: 'Cash', color: '#123456' }
];

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
		expect(chart.dispatchAction).toHaveBeenCalledWith({ type: 'legendToggleSelect', name: 'Cash' });
		expect(button.getAttribute('aria-pressed')).toBe('false');

		await userEvent.click(button);
		expect(button.getAttribute('aria-pressed')).toBe('true');
	});

	it('renders no legend without values', () => {
		render(DoughnutChart, { values: [] });

		expect(screen.queryByRole('button')).toBeNull();
	});
});
