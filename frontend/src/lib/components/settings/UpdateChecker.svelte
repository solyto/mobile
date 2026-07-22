<script lang="ts">
	import IconRefreshCw from '@lucide/svelte/icons/refresh-cw';
	import IconDownload from '@lucide/svelte/icons/download';

	type UpdaterStatus =
		| { type: 'idle' }
		| { type: 'checking' }
		| { type: 'up-to-date' }
		| { type: 'available'; version: string }
		| { type: 'downloading'; percent: number }
		| { type: 'ready' }
		| { type: 'error' };

	const electronAPI = (window as any).electronAPI;

	let status: UpdaterStatus = $state({ type: 'idle' });

	$effect(() => {
		return electronAPI.onUpdaterStatus((s: UpdaterStatus) => {
			status = s;
		});
	});

	async function check() {
		status = { type: 'checking' };
		try {
			await electronAPI.checkForUpdates();
		} catch {
			status = { type: 'error' };
		}
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
			Check for updates
		</button>
		{#if status.type === 'ready'}
			<button
				class="flex cursor-pointer items-center gap-2 rounded-lg bg-c-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-c-primary/80"
				onclick={() => electronAPI.installUpdate()}
			>
				<IconDownload size={14} />
				Install & Restart
			</button>
		{/if}
	</div>
	{#if status.type === 'up-to-date'}
		<p class="text-xs text-c-neutral-5 dark:text-c-neutral-4">You're on the latest version.</p>
	{:else if status.type === 'available'}
		<p class="text-xs text-c-neutral-5 dark:text-c-neutral-4">Update {status.version} available — downloading…</p>
	{:else if status.type === 'downloading'}
		<p class="text-xs text-c-neutral-5 dark:text-c-neutral-4">Downloading… {status.percent}%</p>
	{:else if status.type === 'ready'}
		<p class="text-xs text-c-neutral-5 dark:text-c-neutral-4">Update ready to install.</p>
	{:else if status.type === 'error'}
		<p class="text-xs text-red-500">Update check failed. Check your connection.</p>
	{/if}
</div>
