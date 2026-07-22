<script lang="ts">
	let {
		input = $bindable(),
		value = $bindable(),
		placeholder,
		onblur,
		oninput
	} = $props<{
		input?: HTMLInputElement | null;
		value: string;
		placeholder?: string;
		onblur?: () => void;
		oninput?: () => void;
	}>();
</script>

<input
	bind:this={input}
	bind:value
	{onblur}
	{oninput}
	type="date"
	class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-2 dark:focus:ring-c-primary"
	{placeholder}
/>
