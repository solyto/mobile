<script lang="ts">
	import { onMount } from 'svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconLoaderCircle from '$lib/icons/lucide/loader-circle.svelte';
	import { getExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { ExternalAccountError, ExternalCalendarAccount, ExternalCalendarCandidate } from '$lib/types/calendar';

	let { account, onDone }: {
		account: ExternalCalendarAccount;
		onDone: () => void;
	} = $props();

	const externalCalendars = getExternalCalendars();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();
	const uid = $props.id();

	let candidates = $state<ExternalCalendarCandidate[] | null>(null);
	let selected = $state<string[]>([]);
	let loading = $state<boolean>(true);
	let submitting = $state<boolean>(false);
	let error = $state<ExternalAccountError | null>(null);

	onMount(loadCandidates);

	async function loadCandidates(): Promise<void> {
		loading = true;
		error = null;

		try {
			const result = await externalCalendars.loadAvailable(account);
			if (result.ok) {
				candidates = result.data;
			} else {
				error = result.error;
			}
		} finally {
			loading = false;
		}
	}

	function toggle(url: string): void {
		selected = selected.includes(url) ? selected.filter((u) => u !== url) : [...selected, url];
	}

	function allConnected(): boolean {
		return candidates !== null && candidates.every((candidate) => candidate.is_connected);
	}

	function errorMessage(): string | null {
		return error ? externalCalendars.service.message(error, ts.get.calendar, ts.get.layout) : null;
	}

	function changePassword(): void {
		externalCalendars.openDialog({ step: 'credentials', account, returnToCalendars: true });
	}

	async function connect(): Promise<void> {
		if (submitting || selected.length === 0) return;

		submitting = true;
		error = null;
		loadingIndicator.start();
		const token = externalCalendars.dialogToken();

		try {
			const result = await externalCalendars.connect(account, selected);
			if (!externalCalendars.isDialogCurrent(token)) return;
			if (result.ok) {
				notifications.success(ts.get.calendar.connect_success);
				onDone();
			} else {
				error = result.error;
			}
		} finally {
			submitting = false;
			loadingIndicator.stop();
		}
	}
</script>

<div class="flex flex-col gap-3">
	{#if loading}
		<div class="flex justify-center py-6">
			<IconLoaderCircle class="animate-spin text-c-neutral-5" />
		</div>
	{:else if candidates !== null}
		<p class="text-sm text-c-neutral-5">
			{allConnected() ? ts.get.calendar.connect_all_connected : ts.get.calendar.connect_choose}
		</p>
		<div class="flex flex-col gap-2">
			{#each candidates as candidate, i (candidate.url)}
				<div class="flex w-full items-center justify-between gap-2 border-l-4 pl-3" style="border-color: {candidate.color};">
					<label
						for="{uid}-candidate-{i}"
						class="min-w-0 flex-1 truncate py-2 text-sm"
						class:cursor-pointer={!candidate.is_connected && !submitting}
					>
						{candidate.name}
					</label>
					<span class="flex shrink-0 items-center gap-2">
						{#if candidate.is_connected}
							<span class="text-xs text-c-neutral-4">{ts.get.calendar.connect_already_connected}</span>
						{/if}
						<Checkbox
							id="{uid}-candidate-{i}"
							isChecked={candidate.is_connected || selected.includes(candidate.url)}
							disabled={candidate.is_connected || submitting}
							ariaLabel={candidate.name}
							onchange={() => toggle(candidate.url)}
						/>
					</span>
				</div>
			{/each}
		</div>
	{/if}
	{#if errorMessage()}
		<p class="text-sm text-c-danger">{errorMessage()}</p>
	{/if}
	<div class="mt-2 flex items-center justify-end gap-2">
		{#if submitting}
			<IconLoaderCircle class="size-5 animate-spin text-c-neutral-5" />
		{/if}
		{#if error?.reason === 'credentials_rejected'}
			<TextButton title={ts.get.calendar.account_change_password} type="slight" onclick={changePassword} />
		{/if}
		{#if candidates === null && !loading}
			<TextButton title={ts.get.layout.reload} type="slight" onclick={loadCandidates} />
		{/if}
		{#if candidates !== null && !allConnected()}
			<TextButton
				title={ts.get.calendar.connect_selected}
				onclick={connect}
				disabled={submitting || selected.length === 0}
			/>
		{/if}
	</div>
</div>
