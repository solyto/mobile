<script lang="ts">
	import { onMount } from 'svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import ExternalAccountEntry from '$lib/components/calendars/ExternalAccountEntry.svelte';
	import IconLoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { getExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const externalCalendars = getExternalCalendars();
	const ts = getTranslation();

	onMount(load);

	function load(): Promise<void> {
		return externalCalendars.load();
	}

	function connect(): void {
		externalCalendars.openDialog({ step: 'connect' });
	}
</script>

<div class="flex flex-col gap-2">
	<p class="px-1 text-xs font-semibold uppercase tracking-wider text-c-neutral-4">
		{ts.get.calendar.connected_accounts}
	</p>
	{#if !externalCalendars.loaded && externalCalendars.loadFailed}
		<div class="flex items-center justify-between gap-2 px-1">
			<p role="alert" class="text-sm text-c-danger">{ts.get.calendar.accounts_load_error}</p>
			<TextButton title={ts.get.layout.reload} type="slight" onclick={load} />
		</div>
	{:else if !externalCalendars.loaded}
		<div class="flex justify-center py-2">
			<IconLoaderCircle class="size-5 animate-spin text-c-neutral-5" />
		</div>
	{/if}
	{#each externalCalendars.accounts as account (account.id)}
		<ExternalAccountEntry {account} />
	{/each}
	{#if externalCalendars.loaded && externalCalendars.accounts.length === 0}
		<p class="px-1 text-sm text-c-neutral-4">{ts.get.calendar.no_connected_accounts}</p>
	{/if}
	<TextButton title={ts.get.calendar.connect_calendar} type="slight" onclick={connect} class="self-end" />
</div>
