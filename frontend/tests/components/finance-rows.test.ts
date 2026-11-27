import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import type { Finances } from '$lib/state/Finances.svelte';
import BudgetField from '$lib/components/finances/BudgetField.svelte';
import WealthFieldDisplay from '$lib/components/finances/WealthField.svelte';
import FinanceHistory from '$lib/components/finances/FinanceHistory.svelte';
import type { KeyManager } from '$lib/state/KeyManager.svelte';
import { en } from '$lib/i18n/en';
import { renderWithContext } from './helpers/context';
import FinancesHarness from './helpers/FinancesHarness.svelte';
import { budget as budgetItem, wealthField } from '../unit/helpers/factories';

const budget = budgetItem();
const wealth = wealthField();

function renderRow(component: typeof BudgetField | typeof WealthFieldDisplay, props: Record<string, unknown>): Finances {
	let finances: Finances | null = null;
	renderWithContext(FinancesHarness, { component, props: { sectionTotal: 1000, onOpenHistory: vi.fn(), valueFormatter: (value: number) => String(value), ...props }, onReady: (f: Finances) => (finances = f) });
	return finances!;
}

const rows = [
	['budget item', BudgetField, { budget }, 'deleteBudget', 'Rent'],
	['wealth item', WealthFieldDisplay, { wealth }, 'deleteWealthField', 'Savings']
] as const;

describe('Finance rows', () => {
	it.each(rows)('asks before deleting a %s', async (_, component, props, method, title) => {
		const finances = renderRow(component, props);
		const remove = vi.spyOn(finances, method).mockResolvedValue(true);

		await fireEvent.click(screen.getByLabelText(`Delete ${title}`));
		expect(remove).not.toHaveBeenCalled();

		await fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
		expect(remove).toHaveBeenCalledTimes(1);
	});

	it.each(rows)('does not open the history of a %s when deleting it', async (_, component, props, __, title) => {
		const onOpenHistory = vi.fn();
		renderRow(component, { ...props, onOpenHistory });

		await fireEvent.click(screen.getByLabelText(`Delete ${title}`));

		expect(onOpenHistory).not.toHaveBeenCalled();
	});

	it.each(rows)('opens the history of a %s from its labelled edit button', async (_, component, props, __, title) => {
		const onOpenHistory = vi.fn();
		renderRow(component, { ...props, onOpenHistory });

		await fireEvent.click(screen.getByLabelText(`Edit ${title}`));

		expect(onOpenHistory).toHaveBeenCalledTimes(1);
	});

	it('shows a formatted zero when a wealth field has no value yet', () => {
		renderRow(WealthFieldDisplay, {
			wealth: wealthField({ currentValue: null }),
			valueFormatter: (value: number) => `${value.toFixed(2)} €`
		});

		expect(screen.getByText('0.00 €')).toBeInTheDocument();
	});
});

describe('Finance history', () => {
	const entry = { id: 7, date: '2026-11-01', value: 120 };

	function renderHistory(props: Record<string, unknown> = {}): { onUpdate: ReturnType<typeof vi.fn>; onDelete: ReturnType<typeof vi.fn>; keyManager: () => KeyManager } {
		const onUpdate = vi.fn().mockResolvedValue(true);
		const onDelete = vi.fn().mockResolvedValue(true);
		let keyManager: KeyManager | null = null;
		renderWithContext(FinanceHistory, {
			values: [entry],
			itemTitle: 'Rent',
			dateFormat: null,
			onAdd: vi.fn(),
			onUpdate,
			onDelete,
			onDeleteItem: vi.fn(),
			valueFormatter: (value: number) => String(value),
			...props
		}, { onReady: (stores) => (keyManager = stores.keyManager as KeyManager) });
		return { onUpdate, onDelete, keyManager: () => keyManager! };
	}

	it('edits an entry from its labelled edit button', async () => {
		const { onUpdate, keyManager } = renderHistory();

		await fireEvent.click(screen.getByRole('button', { name: en.finances.edit_value }));
		keyManager().handleKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));

		await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledWith(entry, { date: '2026-11-01', value: 120 }));
	});

	it('asks before deleting an entry from its labelled delete button', async () => {
		const { onDelete } = renderHistory();

		await fireEvent.click(screen.getByRole('button', { name: en.finances.delete_value_label }));
		expect(onDelete).not.toHaveBeenCalled();

		await fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
		expect(onDelete).toHaveBeenCalledWith(entry);
	});

	it('offers no delete button when the item must keep its last entry', () => {
		renderHistory({ minValues: 1 });

		expect(screen.queryByRole('button', { name: en.finances.delete_value_label })).toBeNull();
	});
});
