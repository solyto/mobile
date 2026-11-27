import { describe, it, expect } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import { renderWithContext } from './helpers/context';
import ChooseRecurrenceRuleHarness from './helpers/ChooseRecurrenceRuleHarness.svelte';

const startDate = new Date(2026, 5, 10);

function renderRule(rule: string): void {
	renderWithContext(ChooseRecurrenceRuleHarness, { rule, startDate });
}

function intervalInput(): HTMLInputElement {
	return screen.getByRole('spinbutton') as HTMLInputElement;
}

function typeSelect(): HTMLSelectElement {
	return screen.getAllByRole('combobox')[0] as HTMLSelectElement;
}

function unitSelect(): HTMLSelectElement {
	return screen.getAllByRole('combobox')[1] as HTMLSelectElement;
}

function selectedLabel(select: HTMLSelectElement): string {
	return select.options[select.selectedIndex].textContent ?? '';
}

async function typeInterval(value: string): Promise<void> {
	await fireEvent.input(intervalInput(), { target: { value } });
}

describe('Recurrence interval', () => {
	it('opens a rule with an interval as "Custom…"', () => {
		renderRule('FREQ=DAILY;INTERVAL=12');

		expect(typeSelect().value).toBe('custom');
		expect(intervalInput().value).toBe('12');
		expect(selectedLabel(unitSelect())).toBe('days');
	});

	it.each([
		['weekly', 'weeks'],
		['monthly_date', 'months on this date'],
		['monthly_weekday', 'months on a weekday'],
		['yearly', 'years']
	])('sets the rule to %s through the unit "%s"', async (type, unit) => {
		renderRule('FREQ=DAILY;INTERVAL=3');

		await fireEvent.change(unitSelect(), { target: { value: type } });

		expect(screen.getByTestId('type').textContent).toBe(type);
		expect(screen.getByTestId('interval').textContent).toBe('3');
		expect(selectedLabel(unitSelect())).toBe(unit);
	});

	it('shows no interval field for an interval of 1', () => {
		renderRule('FREQ=WEEKLY;BYDAY=WE');

		expect(typeSelect().value).toBe('weekly');
		expect(screen.queryByRole('spinbutton')).toBeNull();
	});

	it('shows the interval after choosing "Custom…", in the singular for 1', async () => {
		renderRule('FREQ=WEEKLY;BYDAY=WE');

		await fireEvent.change(typeSelect(), { target: { value: 'custom' } });

		expect(intervalInput().value).toBe('1');
		expect(selectedLabel(unitSelect())).toBe('week');
		expect(screen.getByTestId('type').textContent).toBe('weekly');
	});

	it('saves an interval set after choosing "Custom…"', async () => {
		renderRule('FREQ=WEEKLY;BYDAY=WE');

		await fireEvent.change(typeSelect(), { target: { value: 'custom' } });
		await typeInterval('2');

		expect(screen.getByTestId('interval').textContent).toBe('2');
	});

	it('resets the interval to 1 when a preset is chosen', async () => {
		renderRule('FREQ=DAILY;INTERVAL=3');

		await fireEvent.change(typeSelect(), { target: { value: 'weekly' } });

		expect(screen.queryByRole('spinbutton')).toBeNull();
		expect(screen.getByTestId('interval').textContent).toBe('1');
		expect(screen.getByTestId('type').textContent).toBe('weekly');
	});

	it('names the end in its options, without a separate label', () => {
		renderRule('FREQ=WEEKLY;BYDAY=WE');

		const ends = screen.getByRole('combobox', { name: 'Ends' }) as HTMLSelectElement;
		expect([...ends.options].map((option) => option.textContent)).toEqual(['Never ends', 'Ends on date']);
		expect(screen.queryByText('Ends', { selector: 'span' })).toBeNull();
	});

	it('keeps the opened field when the interval goes back to 1', async () => {
		renderRule('FREQ=DAILY;INTERVAL=3');

		await typeInterval('1');
		await fireEvent.blur(intervalInput());

		expect(intervalInput().value).toBe('1');
	});

	it.each([
		['0', '1'],
		['1500', '999'],
		['', '4']
	])('turns %j into %s on blur', async (typed, expected) => {
		renderRule('FREQ=DAILY;INTERVAL=4');

		await typeInterval(typed);
		await fireEvent.blur(intervalInput());

		expect(screen.getByTestId('interval').textContent).toBe(expected);
		expect(intervalInput().value).toBe(expected);
	});

	it.each([
		['', '4'],
		['2.5', '3'],
		['1500', '999']
	])('keeps a saveable interval while %j is typed, before any blur', async (typed, expected) => {
		renderRule('FREQ=DAILY;INTERVAL=4');

		await typeInterval(typed);

		expect(screen.getByTestId('interval').textContent).toBe(expected);
	});

	it('falls back to the last valid value typed before an empty input', async () => {
		renderRule('FREQ=DAILY;INTERVAL=4');

		await typeInterval('7');
		await typeInterval('');
		await fireEvent.blur(intervalInput());

		expect(screen.getByTestId('interval').textContent).toBe('7');
	});
});
