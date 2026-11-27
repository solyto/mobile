import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/svelte';
import Counter from '$lib/components/todos/Counter.svelte';
import { renderWithContext } from './helpers/context';
import { todo } from '../unit/helpers/factories';

describe('Counter', () => {
	it('shows the number of todos', () => {
		renderWithContext(Counter, { todos: [todo(), todo()] });
		expect(screen.getByText('2 Todos')).toBeInTheDocument();
	});

	it('shows zero when there are no todos', () => {
		renderWithContext(Counter, { todos: [] });
		expect(screen.getByText('0 Todos')).toBeInTheDocument();
	});
});
