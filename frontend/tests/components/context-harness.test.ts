import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/svelte';
import { renderWithContext } from './helpers/context';
import Counter from '$lib/components/todos/Counter.svelte';
import { todo } from '../unit/helpers/factories';

describe('harness smoke', () => {
	it('renders a component through the context harness', () => {
		renderWithContext(Counter, { todos: [todo(), todo()] });
		expect(screen.getByText('2 Todos')).toBeInTheDocument();
	});

	it('exposes the created store instances via onReady', () => {
		const onReady = vi.fn();
		renderWithContext(Counter, { todos: [] }, { onReady });
		expect(onReady).toHaveBeenCalled();
		const stores = onReady.mock.calls[0][0];
		expect(stores.ts).toBeDefined();
		expect(stores.todos).toBeDefined();
		expect(stores.auth).toBeDefined();
	});
});
