import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Checkbox from '$lib/components/forms/Checkbox.svelte';
import TextInput from '$lib/components/forms/TextInput.svelte';
import Toggle from '$lib/components/forms/Toggle.svelte';
import Select from '$lib/components/forms/Select.svelte';
import TextInputHarness from './helpers/TextInputHarness.svelte';
import ColorPickerInput from '$lib/components/forms/ColorPickerInput.svelte';
import ColorPicker from '$lib/components/forms/ColorPicker.svelte';
import ColorPickerHarness from './helpers/ColorPickerHarness.svelte';

describe('Checkbox', () => {
	it('renders a checkbox reflecting its checked state', () => {
		render(Checkbox, { props: { isChecked: true } });
		expect(screen.getByRole('checkbox')).toBeChecked();
	});

	it('fires onchange when toggled', async () => {
		const user = userEvent.setup();
		const onchange = vi.fn();
		render(Checkbox, { props: { isChecked: false, onchange } });
		await user.click(screen.getByRole('checkbox'));
		expect(onchange).toHaveBeenCalledTimes(1);
	});
});

describe('TextInput', () => {
	it('renders an input with placeholder and value', () => {
		render(TextInput, { props: { value: 'hello', placeholder: 'Name' } });
		expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
		expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
	});

	it('renders a textarea in multiline mode', () => {
		const { container } = render(TextInput, {
			props: { value: '', multiLine: true, placeholder: 'Desc' }
		});
		expect(container.querySelector('textarea')).toBeInTheDocument();
		expect(screen.queryByRole('textbox')).toBeInTheDocument();
	});

	it('forwards input changes to the bound value', async () => {
		const user = userEvent.setup();
		render(TextInputHarness);
		const input = screen.getByRole('textbox');
		await user.clear(input);
		await user.type(input, 'two');
		expect(screen.getByTestId('value')).toHaveTextContent('two');
	});
});

describe('Toggle', () => {
	it('renders the label and calls onchange with the new value', async () => {
		const user = userEvent.setup();
		const onchange = vi.fn();
		render(Toggle, { props: { checked: false, label: 'Enable', onchange } });
		expect(screen.getByText('Enable')).toBeInTheDocument();
		await user.click(screen.getByRole('checkbox'));
		expect(onchange).toHaveBeenCalledWith(true);
	});

	it('switches without an onchange handler', async () => {
		const user = userEvent.setup();
		render(Toggle, { props: { checked: false, label: 'Enable' } });
		await user.click(screen.getByRole('checkbox'));
		expect(screen.getByRole('checkbox')).toBeChecked();
	});
});

describe('Select', () => {
	const options = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' }
	];

	it('renders all options and selects the bound value', () => {
		render(Select, { props: { value: 'banana', options } });
		expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('value', 'banana');
		expect(screen.getByRole('combobox')).toHaveValue('banana');
	});

	it('calls onchange when a different option is selected', async () => {
		const user = userEvent.setup();
		const onchange = vi.fn();
		render(Select, { props: { value: 'apple', options, onchange } });
		await user.selectOptions(screen.getByRole('combobox'), 'banana');
		expect(onchange).toHaveBeenCalledWith('banana');
	});
});

describe('ColorPickerInput', () => {
	function renderInput() {
		return render(ColorPickerInput, { props: { hex: '#123456', label: '', dir: 'ltr', labelElement: undefined } });
	}

	it('draws the colour as its swatch', () => {
		const { container } = renderInput();
		const swatch = container.querySelector('label span') as HTMLElement;

		expect(swatch.style.background).toBe('rgb(18, 52, 86)');
	});

	it("keeps the browser's own colour dialog closed", () => {
		const { container } = renderInput();
		const input = container.querySelector('input[type="color"]') as HTMLInputElement;

		for (const type of ['click', 'mousedown']) {
			const event = new MouseEvent(type, { bubbles: true, cancelable: true });
			input.dispatchEvent(event);
			expect(event.defaultPrevented).toBe(true);
		}
	});
});

describe('ColorPicker', () => {
	it('draws the bound colour as its swatch', () => {
		const { container } = render(ColorPickerHarness);
		const swatch = container.querySelector('label span') as HTMLElement;

		expect(swatch.style.background).toBe('rgb(0, 255, 0)');
	});

	it('writes the picked colour back to the bound hex', async () => {
		const user = userEvent.setup();
		render(ColorPickerHarness);

		screen.getByRole('slider', { name: 'hue channel' }).focus();
		await user.keyboard('{Home}');

		expect(screen.getByTestId('hex')).toHaveTextContent('#ff0000');
	});

	it('writes the open state back to the bound isOpen', async () => {
		const user = userEvent.setup();
		const { container } = render(ColorPickerHarness);

		await user.pointer({ keys: '[MouseLeft>]', target: container.querySelector('label') as HTMLElement });

		expect(screen.getByTestId('open')).toHaveTextContent('true');
	});

	it('shows the picker inline without a swatch when not a dialog', () => {
		const { container } = render(ColorPicker, { props: { hex: '#123456', isDialog: false } });

		expect(container.querySelector('label')).toBeNull();
		expect(container.querySelector('.wrapper')).toHaveClass('is-open');
	});
});
