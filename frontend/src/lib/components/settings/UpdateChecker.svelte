<script lang="ts">
	import { onMount } from 'svelte';
	import IconRefreshCw from '$lib/icons/lucide/refresh-cw.svelte';
	import IconDownload from '$lib/icons/lucide/download.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { UpdaterStatus } from '$lib/types/platform';

	const STATUS_TEXT = 'text-xs text-c-neutral-5 dark:text-c-neutral-4';

	const ts = getTranslation();
	const electronAPI = window.electronAPI;

	let status: UpdaterStatus = $state({ type: 'idle' });

	onMount(() =>
		electronAPI?.onUpdaterStatus((s) => {
			status = s;
		})
	);

	async function check() {
		status = { type: 'checking' };
		try {
			await electronAPI?.checkForUpdates();
		} catch {
			status = { type: 'error' };
		}
	}

	function install(): void {
		electronAPI?.installUpdate();
	}
</script>

<div class="mt-3 flex flex-col gap-2">
	<div class="flex items-center gap-3">
		<button
			class="flex cursor-pointer items-center gap-2 rounded-lg bg-c-btn px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-c-btn/80 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={status.type === 'checking' || status.type === 'downloading'}
			onclick={check}
		>
			<IconRefreshCw size={14} class={status.type === 'checking' ? 'animate-spin' : ''} />
			{ts.get.settings.update_check}
		</button>
		{#if status.type === 'ready'}
			<button
				class="flex cursor-pointer items-center gap-2 rounded-lg bg-c-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-c-primary/80"
				onclick={install}
			>
				<IconDownload size={14} />
				{ts.get.settings.update_install}
			</button>
		{/if}
	</div>
	{#if status.type === 'up-to-date'}
		<p class={STATUS_TEXT}>{ts.get.settings.update_up_to_date}</p>
	{:else if status.type === 'available'}
		<p class={STATUS_TEXT}>{ts.get.settings.update_available.replace('%s', status.version)}</p>
	{:else if status.type === 'downloading'}
		<p class={STATUS_TEXT}>{ts.get.settings.update_downloading.replace('%s', String(status.percent))}</p>
	{:else if status.type === 'ready'}
		<p class={STATUS_TEXT}>{ts.get.settings.update_ready}</p>
	{:else if status.type === 'error'}
		<p class="text-xs text-red-500">{ts.get.settings.update_check_failed}</p>
	{/if}
</div>
