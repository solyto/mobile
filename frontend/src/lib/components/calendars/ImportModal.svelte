<script lang="ts">
	import { fade } from 'svelte/transition';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import type {
		ImportForm,
		ImportRequest,
		ImportState,
		SelectImportCalendarsRequest
	} from '$lib/types/calendar';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import IconLoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const calendars = getCalendars();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();

	let loading = $state<boolean>(false);
	let form = $state<ImportForm>({
		url: '',
		username: '',
		secret: ''
	});
	let selectedCalendars = $state<string[]>([]);
	let importState = $state<ImportState | null>(null);
	let error = $state<boolean>(false);

	async function initImport(): Promise<void> {
		if (form.url === '' || form.username === '' || form.secret === '') return;

		loadingIndicator.start();
		loading = true;

		const request = form as ImportRequest;
		const res = await calendars.startImport(request);

		loadingIndicator.stop();

		if (!res) {
			error = true;
			loading = false;
			return;
		}

		await loadState();
	}

	function selectCalendar(calendar: string): void {
		if (selectedCalendars.includes(calendar)) {
			selectedCalendars = selectedCalendars.filter((c) => c !== calendar);
		} else {
			selectedCalendars.push(calendar);
		}
	}

	async function startImport(): Promise<void> {
		if (selectedCalendars.length === 0) return;

		loadingIndicator.start();
		loading = true;

		const request: SelectImportCalendarsRequest = { calendars: selectedCalendars };
		const res = await calendars.selectImportCalendars(request);

		loadingIndicator.stop();

		if (res) await loadState(true);
	}

	async function loadState(firstCall: boolean = false): Promise<void> {
		setTimeout(async () => {
			const state = await calendars.getImportState();

			if (!state && !firstCall) {
				return;
			}

			importState = state;

			if (importState?.stage === 'select') loading = false;

			if (importState?.stage === 'finished') {
				notifications.success(ts.get.calendar.import_success);
				await calendars.loadCalendars();
				await calendars.loadEvents();
				onClose();
			}

			if (loading) {
				await loadState();
			}
		}, 1000);
	}

	function onClose(): void {
		importState = null;
		error = false;
		loading = false;
		calendars.importModal = false;
		selectedCalendars = [];
	}
</script>

{#if calendars.importModal}
	<ContentModal title={ts.get.calendar.import_calendars} rounded="2xl" {onClose}>
		{#if loading}
			<div
				class="absolute top-[10px] right-[10px] z-20 rounded-full bg-c-primary p-1 text-white shadow-lg"
			>
				<IconLoaderCircle class="animate-spin" />
			</div>
		{/if}
		{#if importState === null && !loading && !error}
			<div class="flex flex-col gap-2">
				<ModalFormRow label="URL">
					<TextInput bind:value={form.url} />
				</ModalFormRow>
				<ModalFormRow label="Username">
					<TextInput bind:value={form.username} />
				</ModalFormRow>
				<ModalFormRow label="Secret">
					<PasswordInput bind:value={form.secret} />
				</ModalFormRow>
				<TextButton title="Import" onclick={initImport} class="mt-4" />
			</div>
		{:else if importState === null && loading}
			<p>{ts.get.calendar.import_start}</p>
		{:else if importState === null && error}
			<p>{ts.get.calendar.import_error}</p>
		{:else if importState?.stage === 'select'}
			<div class="flex flex-col gap-2">
				{#each importState?.calendars as calendar (calendar)}
					<div class="flex w-full justify-between" in:fade>
						<span>{calendar}</span>
						<Checkbox
							isChecked={false}
							onchange={() => {
								selectCalendar(calendar);
							}}
						/>
					</div>
				{/each}
				<TextButton title="Import" onclick={startImport} class="mt-4" />
			</div>
		{:else if importState?.stage === 'calendars'}
			{#if importState?.calendars_current}
				<p>
					{ts.get.calendar.import_create_calendar.replace(
						'%s',
						importState.calendars_current
					)}
				</p>
			{:else}
				<p>{ts.get.calendar.import_calendars_running}</p>
			{/if}
		{:else if importState?.stage === 'events'}
			<div class="flex flex-col gap-2">
				<p>
					{ts.get.calendar.import_events
						.replace('%s', importState.calendars_current ?? '')
						.replace(
							'%d',
							importState.events_count > 0 ? importState.events_count + ' ' : ''
						)}
				</p>
				{#if importState.events_count > 0}
					<div
						class="mt-2 h-4 w-full rounded-lg border-1 border-c-primary shadow-sm"
						in:fade
					>
						<div
							class="h-full rounded-lg bg-c-primary transition-all duration-1000"
							style="width: {(importState?.events_done / importState?.events_count) *
								100}%;"
						></div>
					</div>
				{/if}
			</div>
		{/if}
	</ContentModal>
{/if}
