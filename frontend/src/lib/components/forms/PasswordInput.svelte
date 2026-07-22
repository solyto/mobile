<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';

	let {
		input = $bindable(),
		value = $bindable(),
		placeholder,
		showToggle = false,
		onblur,
		oninput,
		tabindex = null
	} = $props<{
		input?: HTMLInputElement | null;
		value: string;
		placeholder?: string;
		showToggle?: boolean;
		onblur?: () => void;
		oninput?: () => void;
		tabindex?: number | null;
	}>();

	const ts = getTranslation();

	let visible = $state(false);
</script>

<div class="relative">
	<input
		bind:this={input}
		bind:value
		{onblur}
		{oninput}
		type={visible ? 'text' : 'password'}
		class="
			w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary
			{showToggle ? 'pr-9': ''}
		"
		{placeholder}
		{tabindex}
	/>
	{#if showToggle}
		<button
			type="button"
			onclick={() => (visible = !visible)}
			aria-label={visible ? ts.get.auth.hide_password : ts.get.auth.show_password}
			class="absolute inset-y-0 right-2 flex items-center text-c-neutral-4 hover:text-c-neutral-6 dark:text-c-neutral-5 dark:hover:text-c-neutral-3"
		>
			{#if visible}
				<EyeOff class="size-4" />
			{:else}
				<Eye class="size-4" />
			{/if}
		</button>
	{/if}
</div>
