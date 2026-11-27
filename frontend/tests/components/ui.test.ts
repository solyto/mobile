import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Heading from '$lib/components/ui/Heading.svelte';
import Badge from '$lib/components/ui/Badge.svelte';
import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
import BackButton from '$lib/components/ui/buttons/BackButton.svelte';
import GhostIconButton from '$lib/components/ui/buttons/GhostIconButton.svelte';
import { createRawSnippet } from 'svelte';
import ViewSwitcher from '$lib/components/ui/ViewSwitcher.svelte';
import OptionCard from '$lib/components/ui/OptionCard.svelte';

describe('Heading', () => {
	it('renders the title', () => {
		render(Heading, { props: { title: 'Hello', my: 4 } });
		expect(screen.getByText('Hello')).toBeInTheDocument();
	});
});

describe('Badge', () => {
	it('renders the count with the given background color', () => {
		const { container } = render(Badge, { props: { i: 42, color: '#ff0000' } });
		expect(screen.getByText('42')).toBeInTheDocument();
		expect(container.querySelector('div')).toHaveStyle('background-color: #ff0000');
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

describe('BackButton', () => {
	it('shows its title and goes back when clicked', async () => {
		const onclick = vi.fn();
		render(BackButton, { props: { title: 'Sports', onclick } });

		await fireEvent.click(screen.getByRole('button', { name: 'Sports' }));
		expect(onclick).toHaveBeenCalledOnce();
	});
});

describe('GhostIconButton', () => {
	const icon = createRawSnippet(() => ({ render: () => '<svg></svg>' }));

	it('is labelled and clickable', async () => {
		const onclick = vi.fn();
		render(GhostIconButton, { props: { label: 'Move up', onclick, children: icon } });

		await fireEvent.click(screen.getByRole('button', { name: 'Move up' }));
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('can be disabled', () => {
		render(GhostIconButton, { props: { label: 'Move up', onclick: vi.fn(), disabled: true, children: icon } });
		expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled();
	});
});

describe('OptionCard', () => {
	it('shows its label and hint and reports a click', async () => {
		const onclick = vi.fn();
		render(OptionCard, { props: { label: 'Count', hint: 'e.g. glasses of water', onclick } });

		expect(screen.getByText('e.g. glasses of water')).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: /Count/ }));
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('tells whether it is the chosen option, when it is a choice', () => {
		render(OptionCard, { props: { label: 'Count', selected: true, onclick: vi.fn() } });
		expect(screen.getByRole('button', { name: 'Count' })).toHaveAttribute('aria-pressed', 'true');
	});

	it('is a plain button without a selected state', () => {
		render(OptionCard, { props: { label: 'Favourite', stripeColor: 'red', onclick: vi.fn() } });
		expect(screen.getByRole('button', { name: 'Favourite' })).not.toHaveAttribute('aria-pressed');
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
});
