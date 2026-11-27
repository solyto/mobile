<script lang="ts">
	import type { Cooldown } from '$lib/helpers/Cooldown.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { cooldown, onclick }: { cooldown: Cooldown; onclick: () => void } = $props();

	const ts = getTranslation();
</script>

<button
	type="button"
	class="mt-2 text-xs text-s-primary disabled:opacity-40"
	disabled={cooldown.active}
	{onclick}
>
	{ts.get.auth.forgot_password_resend}
	{#if cooldown.active}{ts.get.auth.resend_cooldown.replace('%d', String(cooldown.remaining))}{/if}
</button>
