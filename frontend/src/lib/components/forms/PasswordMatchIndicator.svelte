<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';

	let { password, passwordConfirmation } = $props<{
		password: string;
		passwordConfirmation: string;
	}>();

	const ts = getTranslation();

	const matches = $derived(
		passwordConfirmation.length > 0 && password === passwordConfirmation
	);
</script>

{#if passwordConfirmation.length > 0}
	<div
		class="mt-2 flex items-center gap-1.5 text-xs {matches
			? 'text-green-600 dark:text-green-400'
			: 'text-c-neutral-4 dark:text-c-neutral-5'}"
	>
		{#if matches}
			<Check class="size-3.5" />
		{:else}
			<X class="size-3.5" />
		{/if}
		{ts.get.auth.password_matches}
	</div>
{/if}
