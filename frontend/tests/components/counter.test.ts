import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Counter from '$lib/components/todos/Counter.svelte';
import { todo } from '../unit/helpers/factories';

describe('Counter', () => {
	it('shows the number of todos', () => {
		render(Counter, { props: { todos: [todo(), todo()] } });
		expect(screen.getByText('2 Todos')).toBeInTheDocument();
	});

	it('shows zero when there are no todos', () => {
		render(Counter, { props: { todos: [] } });
		expect(screen.getByText('0 Todos')).toBeInTheDocument();
	});
});
