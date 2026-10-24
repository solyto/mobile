import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Heading from '$lib/components/ui/Heading.svelte';
import Badge from '$lib/components/ui/Badge.svelte';
import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
import ViewSwitcher from '$lib/components/ui/ViewSwitcher.svelte';

describe('Heading', () => {
	it('renders the title', () => {
		render(Heading, { props: { title: 'Hello', my: 4 } });
		expect(screen.getByText('Hello')).toBeInTheDocument();
	});

	it('applies the bold class when bold', () => {
		const { container } = render(Heading, { props: { title: 'Bold', my: 0, bold: true } });
		expect(container.querySelector('.font-bold')).toBeInTheDocument();
	});
});

describe('Badge', () => {
	it('renders the count with the given background color', () => {
		const { container } = render(Badge, { props: { i: 42, color: '#ff0000' } });
		expect(screen.getByText('42')).toBeInTheDocument();
		expect(container.querySelector('div')).toHaveStyle('background-color: #ff0000');
	});

	it('renders a smaller font for three-digit counts', () => {
		const { container } = render(Badge, { props: { i: 123, color: '#fff' } });
		expect(container.querySelector('.text-xs')).toBeInTheDocument();
	});
});

describe('CloseButton', () => {
	it('fires onClick when clicked', () => {
		const onClick = vi.fn();
		render(CloseButton, { props: { onClick, inModal: false } });
		fireEvent.click(screen.getByRole('button'));
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});

describe('DeleteButton', () => {
	it('fires onClick when clicked', () => {
		const onClick = vi.fn();
		render(DeleteButton, { props: { onClick, inModal: false } });
		fireEvent.click(screen.getByRole('button'));
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});

describe('AddButton', () => {
	it('fires onClick when clicked', () => {
		const onClick = vi.fn();
		render(AddButton, { props: { onClick } });
		fireEvent.click(screen.getByRole('button'));
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});

describe('ViewSwitcher', () => {
	const views = [
		{ type: 'list' as const, title: 'List' },
		{ type: 'kanban' as const, title: 'Kanban' }
	];

	it('renders a button per view with the given titles', () => {
		render(ViewSwitcher, { props: { views, currentlySelected: 'list', onChange: vi.fn() } });
		expect(screen.getByTitle('List')).toBeInTheDocument();
		expect(screen.getByTitle('Kanban')).toBeInTheDocument();
	});

	it('calls onChange with the selected view type', () => {
		const onChange = vi.fn();
		render(ViewSwitcher, { props: { views, currentlySelected: 'list', onChange } });
		fireEvent.click(screen.getByTitle('Kanban'));
		expect(onChange).toHaveBeenCalledWith('kanban');
	});

	it('highlights the currently selected view', () => {
		const { container } = render(ViewSwitcher, {
			props: { views, currentlySelected: 'list', onChange: vi.fn() }
		});
		const buttons = container.querySelectorAll('button');
		expect(buttons[0].classList.contains('bg-c-neutral-1')).toBe(true);
		expect(buttons[1].classList.contains('bg-c-neutral-1')).toBe(false);
	});
});
