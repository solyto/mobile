<script lang="ts">
	import AwesomeColorPicker from 'svelte-awesome-color-picker';
	import ColorPickerInput from '$lib/components/forms/ColorPickerInput.svelte';
	import ColorPickerWrapper from '$lib/components/forms/ColorPickerWrapper.svelte';

	let {
		hex = $bindable(),
		isDialog = true,
		isOpen = $bindable(!isDialog)
	}: {
		hex: string;
		isDialog?: boolean;
		isOpen?: boolean;
	} = $props();
</script>

<AwesomeColorPicker
	components={{ input: ColorPickerInput, wrapper: ColorPickerWrapper }}
	isAlpha={false}
	bind:hex
	bind:isOpen
	{isDialog}
	position="fixed"
	nullable={false}
	label=""
	isTextInput={false}
	--cp-border-color="var(--color-c-neutral-2)"
/>
