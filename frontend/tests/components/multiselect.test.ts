import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import MultiSelectHarness from './helpers/MultiSelectHarness.svelte';

const existing = [{ label: 'RPG', value: '1' }];

async function createOption(label: string): Promise<void> {
	const user = userEvent.setup();
	await user.type(screen.getByRole('searchbox'), `${label}{Enter}`);
}

describe('MultiSelect', () => {
	it('stores the id returned by oncreate on the created entry', async () => {
		const oncreate = vi.fn().mockResolvedValue('42');
		render(MultiSelectHarness, { props: { options: existing, oncreate } });
		await createOption('Roguelike');
		expect(oncreate).toHaveBeenCalledWith('Roguelike');
		await waitFor(() =>
			expect(screen.getByTestId('value')).toHaveTextContent('[{"label":"Roguelike","value":"42"}]')
		);
	});

	it('stores the id when there are no options yet', async () => {
		const oncreate = vi.fn().mockResolvedValue('7');
		render(MultiSelectHarness, { props: { options: [], oncreate } });
		await createOption('Roguelike');
		await waitFor(() =>
			expect(screen.getByTestId('value')).toHaveTextContent('[{"label":"Roguelike","value":"7"}]')
		);
	});

	it('drops the entry when oncreate fails', async () => {
		const oncreate = vi.fn().mockResolvedValue(null);
		render(MultiSelectHarness, { props: { options: existing, oncreate } });
		await createOption('Roguelike');
		expect(oncreate).toHaveBeenCalled();
		await waitFor(() => expect(screen.getByTestId('value')).toHaveTextContent('[]'));
	});
});
