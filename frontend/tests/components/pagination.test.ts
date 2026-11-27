import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/svelte';
import Pagination from '$lib/components/ui/Pagination.svelte';
import { renderWithContext } from './helpers/context';

describe('Pagination', () => {
	it('shows the current and last page', () => {
		renderWithContext(Pagination, { page: 2, lastPage: 40, onchange: vi.fn() });
		expect(screen.getByText('Page 2 of 40')).toBeInTheDocument();
	});

	it('requests the neighbouring pages', async () => {
		const onchange = vi.fn();
		renderWithContext(Pagination, { page: 2, lastPage: 40, onchange });

		await fireEvent.click(screen.getByLabelText('Previous page'));
		await fireEvent.click(screen.getByLabelText('Next page'));

		expect(onchange.mock.calls).toEqual([[1], [3]]);
	});

	it('disables previous on the first page and next on the last', () => {
		renderWithContext(Pagination, { page: 1, lastPage: 1, onchange: vi.fn() });
		expect(screen.getByLabelText('Previous page')).toBeDisabled();
		expect(screen.getByLabelText('Next page')).toBeDisabled();
	});
});
