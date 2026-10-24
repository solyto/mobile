import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import InputAutocomplete from '$lib/components/forms/InputAutocomplete.svelte';
import InlineAutocomplete from '$lib/components/forms/InlineAutocomplete.svelte';
import Slider from '$lib/components/forms/Slider.svelte';

describe('InputAutocomplete', () => {
	const items = [{ label: 'Apple' }, { label: 'Apricot' }, { label: 'Banana' }];

	it('shows matching suggestions while typing', async () => {
		const user = userEvent.setup();
		render(InputAutocomplete, { props: { value: '', items } });

		const input = screen.getByRole('textbox');
		await user.type(input, 'ap');

		expect(screen.getByText('Apple')).toBeInTheDocument();
		expect(screen.getByText('Apricot')).toBeInTheDocument();
		expect(screen.queryByText('Banana')).not.toBeInTheDocument();
	});

	it('dismisses the suggestions when nothing matches', async () => {
		const user = userEvent.setup();
		render(InputAutocomplete, { props: { value: '', items } });

		await user.type(screen.getByRole('textbox'), 'zzz');

		expect(screen.queryByText('Apple')).not.toBeInTheDocument();
	});

	it('accepts a suggestion with Enter and calls onselect', async () => {
		const user = userEvent.setup();
		const onselect = vi.fn();
		render(InputAutocomplete, { props: { value: '', items, onselect } });

		const input = screen.getByRole('textbox');
		await user.type(input, 'ban');

		// first suggestion is highlighted
		await user.keyboard('{Enter}');

		expect(onselect).toHaveBeenCalledWith('Banana');
		expect(screen.getByDisplayValue('Banana')).toBeInTheDocument();
	});

	it('navigates suggestions with the arrow keys before accepting', async () => {
		const user = userEvent.setup();
		const onselect = vi.fn();
		render(InputAutocomplete, { props: { value: '', items, onselect } });

		await user.type(screen.getByRole('textbox'), 'ap');
		await user.keyboard('{ArrowDown}');
		await user.keyboard('{Enter}');

		// second suggestion (Apricot) is selected after ArrowDown
		expect(onselect).toHaveBeenCalledWith('Apricot');
	});

	it('dismisses the suggestions on Escape', async () => {
		const user = userEvent.setup();
		render(InputAutocomplete, { props: { value: '', items } });

		await user.type(screen.getByRole('textbox'), 'ap');
		expect(screen.getByText('Apple')).toBeInTheDocument();

		await user.keyboard('{Escape}');
		expect(screen.queryByText('Apple')).not.toBeInTheDocument();
	});

	it('accepts a suggestion by clicking it', async () => {
		const user = userEvent.setup();
		const onselect = vi.fn();
		render(InputAutocomplete, { props: { value: '', items, onselect } });

		await user.type(screen.getByRole('textbox'), 'app');
		await user.click(screen.getByText('Apple'));

		expect(onselect).toHaveBeenCalledWith('Apple');
	});
});

describe('InlineAutocomplete', () => {
	const triggers = [
		{
			prefix: '@',
			items: [
				{ label: 'Alice', value: 'alice' },
				{ label: 'Aaron', value: 'aaron' }
			]
		},
		{
			prefix: '#',
			items: [{ label: 'Work', value: 'work' }]
		}
	];

	it('shows trigger suggestions while typing a token', async () => {
		const user = userEvent.setup();
		render(InlineAutocomplete, { props: { value: '', triggers } });

		await user.type(screen.getByRole('textbox'), 'Hi @a');

		expect(screen.getByText('Alice')).toBeInTheDocument();
		expect(screen.getByText('Aaron')).toBeInTheDocument();
	});

	it('does not match triggers without their prefix', async () => {
		const user = userEvent.setup();
		render(InlineAutocomplete, { props: { value: '', triggers } });

		await user.type(screen.getByRole('textbox'), 'al');
		expect(screen.queryByText('Alice')).not.toBeInTheDocument();
	});

	it('replaces the token when accepting a suggestion', async () => {
		const user = userEvent.setup();
		render(InlineAutocomplete, { props: { value: '', triggers } });

		const input = screen.getByRole('textbox');
		await user.type(input, 'Hi @al');
		await user.keyboard('{Enter}');

		expect(screen.getByDisplayValue('Hi @alice')).toBeInTheDocument();
	});

	it('dismisses suggestions on Escape', async () => {
		const user = userEvent.setup();
		render(InlineAutocomplete, { props: { value: '', triggers } });

		await user.type(screen.getByRole('textbox'), '#w');
		expect(screen.getByText('Work')).toBeInTheDocument();

		await user.keyboard('{Escape}');
		expect(screen.queryByText('Work')).not.toBeInTheDocument();
	});
});

describe('Slider', () => {
	it('renders the label and value label', () => {
		render(Slider, {
			props: { value: 50, min: 0, max: 100, label: 'Volume', valueLabel: '50%' }
		});
		expect(screen.getByText('Volume')).toBeInTheDocument();
		expect(screen.getByText('50%')).toBeInTheDocument();
	});

	it('computes the fill percentage from the value', () => {
		const { container } = render(Slider, { props: { value: 25, min: 0, max: 100 } });
		const input = container.querySelector('input[type="range"]');
		expect(input).toHaveStyle('--slider-percent: 25%');
	});

	it('fires oninput while dragging and onchange on release', async () => {
		const user = userEvent.setup();
		const oninput = vi.fn();
		const onchange = vi.fn();
		const { container } = render(Slider, {
			props: { value: 0, min: 0, max: 10, oninput, onchange }
		});

		const input = container.querySelector('input[type="range"]')!;
		await user.click(input);
		fireEvent.input(input, { target: { value: '7' } });
		expect(oninput).toHaveBeenCalledWith(7);

		fireEvent.change(input, { target: { value: '8' } });
		expect(onchange).toHaveBeenCalledWith(8);
	});

	it('is disabled when the disabled prop is set', () => {
		const { container } = render(Slider, {
			props: { value: 1, min: 0, max: 10, disabled: true }
		});
		expect(container.querySelector('input[type="range"]')).toBeDisabled();
	});
});
