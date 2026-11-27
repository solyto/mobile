<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Check from '$lib/icons/lucide/check.svelte';
	import X from '$lib/icons/lucide/x.svelte';

	let { password }: { password: string } = $props();

	const ts = getTranslation();

	const hasMinLength = $derived(password.length >= 12);
</script>

{#if password.length > 0}
	<div
		class="mt-2 flex items-center gap-1.5 text-xs {hasMinLength
			? 'text-green-600 dark:text-green-400'
			: 'text-c-neutral-4 dark:text-c-neutral-5'}"
	>
		{#if hasMinLength}
			<Check class="size-3.5" />
		{:else}
			<X class="size-3.5" />
		{/if}
		{ts.get.auth.password_min_length}
	</div>
{/if}
