<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import SegmentedControl from '$lib/components/forms/SegmentedControl.svelte';
	import CaldavForm from '$lib/components/calendars/import/CaldavForm.svelte';
	import CaldavSelect from '$lib/components/calendars/import/CaldavSelect.svelte';
	import FileForm from '$lib/components/calendars/import/FileForm.svelte';
	import type { CalendarImportError, CalendarImportView } from '$lib/services/CalendarImportService';
	import type { ImportFileTarget, ImportRequest, ImportSource, ImportState } from '$lib/types/calendar';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getCalendarImport } from '$lib/state/CalendarImport.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const MUTED = 'text-sm text-c-neutral-5 dark:text-c-neutral-4';

	const calendars = getCalendars();
	const calendarImport = getCalendarImport();
	const ts = getTranslation();

	let source = $state<ImportSource>('caldav');
	let error: CalendarImportError | null = null;
	const saving = new SaveAction(() => errorMessage(error));

	const sourceOptions = [
		{ label: ts.get.calendar.import_source_caldav, value: 'caldav' },
		{ label: ts.get.calendar.import_source_file, value: 'file' }
	];

	function view(): CalendarImportView {
		return calendarImport.stalled ? 'failed' : calendarImport.service.view(calendarImport.state, calendarImport.awaitingState);
	}

	function changeSource(value: string): void {
		source = value === 'file' ? 'file' : 'caldav';
	}

	async function run(action: () => Promise<CalendarImportError | null>): Promise<void> {
		await saving.runIfIdle(async () => {
			error = await action();
			return error === null;
		});
	}

	function startCaldav(request: ImportRequest): void {
		run(() => calendarImport.startCaldavImport(request));
	}

	function selectCaldav(selected: string[]): void {
		run(() => calendarImport.selectCaldavCalendars(selected));
	}

	function importFile(file: File, target: ImportFileTarget): void {
		run(() => calendarImport.importFile(file, target));
	}

	function errorMessage(error: CalendarImportError | null): string {
		switch (error) {
			case 'invalid_file':
				return ts.get.calendar.import_error_invalid_file;
			case 'calendar_not_found':
				return ts.get.calendar.import_error_calendar_not_found;
			case 'calendar_forbidden':
				return ts.get.calendar.import_error_calendar_forbidden;
			case 'already_running':
				return ts.get.calendar.import_error_running;
			case 'rate_limited':
				return ts.get.calendar.import_error_rate_limited;
			default:
				return ts.get.calendar.import_error;
		}
	}

	function progressLabel(state: ImportState): string {
		switch (state.stage) {
			case 'calendars':
				return state.calendars_current
					? ts.get.calendar.import_create_calendar.replace('%s', state.calendars_current)
					: ts.get.calendar.import_calendars_running;
			case 'events':
				return ts.get.calendar.import_events
					.replace('%s', state.calendars_current ?? '')
					.replace('%d', state.events_count > 0 ? state.events_count + ' ' : '');
			default:
				return ts.get.calendar.import_start;
		}
	}

	function close(): void {
		calendarImport.close();
	}
</script>

{#snippet count(label: string, value: number)}
	<div class="flex justify-between">
		<span class={MUTED}>{label}</span>
		<span>{value}</span>
	</div>
{/snippet}

{#if calendarImport.importModal}
	<ContentModal title={ts.get.calendar.import_calendars} rounded="2xl" onClose={close}>
		<div class="flex flex-col gap-4">
			{#if view() === 'start'}
				<SegmentedControl value={source} options={sourceOptions} onchange={changeSource} />
				{#if source === 'caldav'}
					<CaldavForm busy={saving.busy} onsubmit={startCaldav} />
				{:else}
					<FileForm targets={calendarImport.service.targetCalendars(calendars.calendars)} busy={saving.busy} onsubmit={importFile} />
				{/if}
			{:else if view() === 'select' && calendarImport.state}
				<CaldavSelect calendars={calendarImport.state.calendars} busy={saving.busy} onsubmit={selectCaldav} />
			{:else if view() === 'progress' && calendarImport.state}
				<p>{progressLabel(calendarImport.state)}</p>
				{#if calendarImport.state.events_count > 0}
					<ProgressBar value={calendarImport.service.progress(calendarImport.state)} label={progressLabel(calendarImport.state)} />
				{/if}
			{:else if view() === 'finished' && calendarImport.state}
				<p>{ts.get.calendar.import_success}</p>
				{@render count(ts.get.calendar.import_imported, calendarImport.state.events_done)}
				{#if calendarImport.state.events_skipped > 0}
					{@render count(ts.get.calendar.import_skipped, calendarImport.state.events_skipped)}
				{/if}
				<TextButton type="primary" title={ts.get.layout.close} onclick={close} />
			{:else if view() === 'failed'}
				<p class="text-sm text-c-danger" role="alert">{ts.get.calendar.import_error}</p>
				<TextButton type="primary" title={ts.get.layout.close} onclick={close} />
			{/if}
		</div>
	</ContentModal>
{/if}
