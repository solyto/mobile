<script lang="ts">
	let {
		labelElement = $bindable(),
		hex,
		label,
		name = undefined,
		dir
	}: {
		labelElement: HTMLLabelElement | undefined;
		hex: string | null;
		label: string;
		name?: string | undefined;
		dir: 'ltr' | 'rtl';
	} = $props();

	// Keeps the browser's own colour dialog closed; the picker opens its own on mousedown.
	function preventDefault(event: MouseEvent): void {
		event.preventDefault();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<label
	bind:this={labelElement}
	class="m-1 inline-flex h-[25px] cursor-pointer items-center gap-2 select-none"
	onclick={preventDefault}
	onmousedown={preventDefault}
	{dir}
>
	<input
		type="color"
		{name}
		value={hex}
		class="peer absolute size-px opacity-0"
		onclick={preventDefault}
		onmousedown={preventDefault}
		aria-haspopup="dialog"
	/>
	<span
		class="block size-[25px] rounded-full ring-1 ring-c-neutral-3 dark:ring-c-neutral-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-d-lightblue dark:peer-focus-visible:outline-c-primary"
		style:background={hex}
	></span>
	{label}
</label>
