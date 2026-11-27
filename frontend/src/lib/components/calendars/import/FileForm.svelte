<script lang="ts">
	import ColorPicker from '$lib/components/forms/ColorPicker.svelte';
	import FileUpload from '$lib/components/forms/FileUpload.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import CalendarImportService, { MAX_CALENDAR_NAME_LENGTH } from '$lib/services/CalendarImportService';
	import type { Calendar, ImportFileTarget } from '$lib/types/calendar';

	let { targets, busy, onsubmit }: {
		targets: Calendar[];
		busy: boolean;
		onsubmit: (file: File, target: ImportFileTarget) => void;
	} = $props();

	const NO_COLOR = 'var(--color-c-neutral-2)';
	const NEW = 'new';

	const ts = getTranslation();
	const service = new CalendarImportService();
	const uid = $props.id();

	let file = $state<File | null>(null);
	let into = $state<string>(NEW);
	let name = $state<string>('');
	let hex = $state<string>(NO_COLOR);
	let suggestedName = '';

	async function pick(picked: File): Promise<boolean> {
		const suggestion = await nameFor(picked);
		if (name === suggestedName) name = suggestion;
		suggestedName = suggestion;
		file = picked;
		return true;
	}

	async function nameFor(picked: File): Promise<string> {
		const content = await picked.text().catch(() => '');
		return service.calendarName(content) ?? service.defaultCalendarName(picked.name);
	}

	function intoOptions(): { label: string; value: string }[] {
		return [
			{ label: ts.get.calendar.import_target_new, value: NEW },
			...targets.map((calendar) => ({ label: calendar.name, value: calendar.id.toString() }))
		];
	}

	function changeInto(value: string): void {
		into = value;
	}

	function target(): ImportFileTarget {
		if (into !== NEW) return { type: 'existing', calendarId: Number(into) };
		return { type: 'new', name, color: hex === NO_COLOR ? null : hex };
	}

	function canSubmit(): boolean {
		return !busy && file !== null;
	}

	function submit(): void {
		if (file !== null && canSubmit()) onsubmit(file, target());
	}
</script>

<div class="flex flex-col gap-3">
	<ModalFormRow label={ts.get.layout.file}>
		<FileUpload accept=".ics" onfile={pick} />
	</ModalFormRow>
	{#if targets.length > 0}
		<ModalFormRow label={ts.get.layout.import_into}>
			<Select value={into} onchange={changeInto} options={intoOptions()} ariaLabel={ts.get.layout.import_into} />
		</ModalFormRow>
	{/if}
	{#if into === NEW}
		<ModalFormRow label={ts.get.layout.name} labelFor="{uid}-name">
			<TextInput bind:value={name} id="{uid}-name" maxlength={MAX_CALENDAR_NAME_LENGTH} />
		</ModalFormRow>
		<ModalFormRow label={ts.get.layout.color}>
			<ColorPicker bind:hex />
		</ModalFormRow>
	{/if}
	<TextButton type="primary" title={ts.get.calendar.import_submit} disabled={!canSubmit()} onclick={submit} class="mt-2" />
</div>
