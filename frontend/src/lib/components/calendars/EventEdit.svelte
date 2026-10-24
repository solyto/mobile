<script lang="ts">
	import { tick } from 'svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import SlidingSideBar from '$lib/components/ui/SlidingSideBar.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import type {
		EventForm,
		CreateEventRequest,
		UpdateEventRequest
	} from '$lib/types/calendar';
	import SvelteDateInput from '$lib/components/forms/SvelteDateInput.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import ChooseCalendar from '$lib/components/calendars/ChooseCalendar.svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import TimePicker from '$lib/components/forms/TimePicker.svelte';
	import ChooseRecurrenceRule from '$lib/components/calendars/ChooseRecurrenceRule.svelte';
	import RecurrenceActionModal from '$lib/components/calendars/RecurrenceActionModal.svelte';
	import EventAttachments from '$lib/components/calendars/EventAttachments.svelte';
	import { formatFloatingDate } from '$lib/helpers/DateHelper';
	import { adjustEventRange, combineDateAndTime } from '$lib/helpers/CalendarEventHelper';
	import RecurrenceRuleService from '$lib/services/RecurrenceRuleService';
	import type { RecurrenceSelection } from '$lib/services/RecurrenceRuleService';

	const calendars = getCalendars();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const recurrenceRuleService = new RecurrenceRuleService();
	const newEventStartHour = calendars.newEventPreset.hour ?? 12;
	const newEventEnd = new Date(
		combineDateAndTime(calendars.selectedDate ?? new Date(), newEventStartHour, 0).getTime() + 60 * 60 * 1000
	);
	const emptyForm: EventForm = {
		calendar_id: 0,
		title: '',
		description: '',
		location: '',
		is_all_day: false,
		is_recurring: false,
		recurrence_rule: null,
		recurrence_end: null,
		start_date: new SvelteDate(),
		start_hours: 12,
		start_minutes: 0,
		end_date: new SvelteDate(),
		end_hours: 13,
		end_minutes: 0
	};
	const initialForm: EventForm = {
		calendar_id: calendars.activeEvent && calendars.activeEvent.calendar_id ?
			Number(calendars.activeEvent.calendar_id) :
			(calendars.calendars[0]?.id ?? 0),
		title: calendars.activeEvent ? calendars.activeEvent.title : '',
		description: calendars.activeEvent ? calendars.activeEvent.description : '',
		location: calendars.activeEvent ? calendars.activeEvent.location : '',
		is_all_day: calendars.activeEvent ? calendars.activeEvent.is_all_day : (calendars.newEventPreset.allDay ?? false),
		is_recurring: calendars.activeEvent ? calendars.activeEvent.is_recurring : false,
		recurrence_rule: calendars.activeEvent ? calendars.activeEvent.recurrence_rule : null,
		recurrence_end: calendars.activeEvent ? calendars.activeEvent.recurrence_end : null,
		start_date: getStartDate(),
		start_hours: calendars.activeEvent ? calendars.activeEvent.start_date.getHours() : newEventStartHour,
		start_minutes: calendars.activeEvent ? calendars.activeEvent.start_date.getMinutes() : 0,
		end_date: getEndDate(),
		end_hours: calendars.activeEvent ? calendars.activeEvent.end_date.getHours() : newEventEnd.getHours(),
		end_minutes: calendars.activeEvent ? calendars.activeEvent.end_date.getMinutes() : 0
	};
	let form = $state<EventForm>(initialForm);
	let recurrence = $state<RecurrenceSelection | null>(
		recurrenceRuleService.parse(initialForm.recurrence_rule, initialForm.start_date)
	);
	// Plain variable: only read inside afterSelect, never rendered.
	let duration = getDuration();
	let titleInput = $state<HTMLInputElement | null>(null);
	let showRecurrenceModal = $state<'edit' | 'delete' | null>(null);

	function isRecurring(): boolean {
		return (
			calendars.activeEvent !== null &&
			calendars.activeEvent.is_recurring &&
			calendars.activeEvent.original_start_date !== null
		);
	}

	function getStartDate(): SvelteDate {
		if (calendars.activeEvent) return new SvelteDate(calendars.activeEvent.start_date);
		if (calendars.selectedDate) return new SvelteDate(calendars.selectedDate);
		return new SvelteDate();
	}

	function getEndDate(): SvelteDate {
		if (calendars.activeEvent) return new SvelteDate(calendars.activeEvent.end_date);
		return new SvelteDate(newEventEnd);
	}

	function getStart(): Date {
		return combineDateAndTime(form.start_date, form.start_hours, form.start_minutes);
	}

	function getEnd(): Date {
		return combineDateAndTime(form.end_date, form.end_hours, form.end_minutes);
	}

	function getDuration(): number {
		return Math.max(0, getEnd().getTime() - getStart().getTime());
	}

	async function afterSelect(changed: 'start' | 'end'): Promise<void> {
		await tick();

		const { start, end } = adjustEventRange(changed, getStart(), getEnd(), duration);
		form.start_date = new SvelteDate(start);
		form.start_hours = start.getHours();
		form.start_minutes = start.getMinutes();
		form.end_date = new SvelteDate(end);
		form.end_hours = end.getHours();
		form.end_minutes = end.getMinutes();
		duration = getDuration();
	}

	function buildRequest(): CreateEventRequest | UpdateEventRequest {
		if (form.is_all_day) {
			form.start_date.setHours(0);
			form.start_date.setMinutes(0);
			form.end_date.setHours(0);
			form.end_date.setMinutes(0);
		} else {
			form.start_date.setHours(form.start_hours);
			form.start_date.setMinutes(form.start_minutes);
			form.end_date.setHours(form.end_hours);
			form.end_date.setMinutes(form.end_minutes);
		}

		return {
			...form,
			start_date: formatFloatingDate(form.start_date),
			end_date: formatFloatingDate(form.end_date),
			recurrence_rule: form.is_recurring ? recurrenceRule() : null,
			recurrence_end: form.recurrence_end ? formatFloatingDate(form.recurrence_end) : null,
			etag: calendars.activeEvent ? calendars.activeEvent.etag : null
		} as UpdateEventRequest;
	}

	function recurrenceRule(): string | null {
		return recurrence ? recurrenceRuleService.build(recurrence, form.start_date) : form.recurrence_rule;
	}

	async function onsubmit(): Promise<void> {
		if (isRecurring()) {
			showRecurrenceModal = 'edit';
			return;
		}
		await doUpdate(false);
	}

	async function onDelete(): Promise<void> {
		if (isRecurring()) {
			showRecurrenceModal = 'delete';
			return;
		}
		await doDelete(false);
	}

	async function doUpdate(thisOccurrenceOnly: boolean): Promise<void> {
		loadingIndicator.start();
		const request = buildRequest();

		const ok = thisOccurrenceOnly
			? await calendars.updateOccurrence(
					calendars.activeEvent!,
					request as UpdateEventRequest,
					calendars.activeEvent!.original_start_date!
				)
			: calendars.activeEvent
				? await calendars.updateEvent(calendars.activeEvent, request as UpdateEventRequest)
				: await calendars.createEvent(request as CreateEventRequest);

		loadingIndicator.stop();
		if (ok) {
			form = { ...emptyForm };
			recurrence = recurrenceRuleService.parse(null, form.start_date);
			calendars.hideSidebar();
		} else {
			notifications.error(ts.get.calendar.entry_create_error);
		}
	}

	async function doDelete(thisOccurrenceOnly: boolean): Promise<void> {
		loadingIndicator.start();

		if (thisOccurrenceOnly) {
			await calendars.deleteOccurrence(
				calendars.activeEvent!,
				calendars.activeEvent!.original_start_date!
			);
		} else {
			await calendars.deleteEvent(calendars.activeEvent!);
		}

		loadingIndicator.stop();
		calendars.hideSidebar();
	}
</script>

<SlidingSideBar
	onClose={() => {
		calendars.hideSidebar();
	}}
	title={calendars.activeEvent ? ts.get.calendar.edit_entry : ts.get.calendar.create_entry}
>
	<div class="flex w-full flex-col items-center gap-2 lg:min-w-80">
		<ChooseCalendar bind:calendar={form.calendar_id} availableCalendars={calendars.calendars} />
		<TextInput
			bind:input={titleInput}
			bind:value={form.title}
			placeholder={ts.get.calendar.title}
		/>
		<div class="flex gap-6">
			<Toggle
				label={ts.get.calendar.is_all_day}
				bind:checked={form.is_all_day}
				onchange={() => {}}
			/>
			<Toggle
				label={ts.get.calendar.is_recurring}
				bind:checked={form.is_recurring}
				onchange={() => {}}
			/>
		</div>
		{#if form.start_date}
			<div class="flex w-full gap-2">
				<SvelteDateInput bind:date={form.start_date} oninput={() => afterSelect('start')} />
				{#if !form.is_all_day}
					<TimePicker
						bind:hours={form.start_hours}
						bind:minutes={form.start_minutes}
						oninput={() => afterSelect('start')}
					/>
				{/if}
			</div>
		{/if}
		{#if form.end_date}
			<div class="flex w-full gap-2">
				<SvelteDateInput bind:date={form.end_date} oninput={() => afterSelect('end')} />
				{#if !form.is_all_day}
					<TimePicker
						bind:hours={form.end_hours}
						bind:minutes={form.end_minutes}
						oninput={() => afterSelect('end')}
					/>
				{/if}
			</div>
		{/if}
		{#if form.is_recurring && recurrence}
			<ChooseRecurrenceRule bind:selection={recurrence} startDate={form.start_date} />
		{:else if form.is_recurring}
			<p class="text-sm text-c-neutral-5">{ts.get.calendar.recurrence_not_editable}</p>
		{/if}
		<TextInput bind:value={form.description} placeholder={ts.get.calendar.description} />
		<TextInput bind:value={form.location} placeholder={ts.get.calendar.location} />

		{#if calendars.activeEvent}
			<EventAttachments eventId={calendars.activeEvent.id} />
		{/if}

		<div
			class="mt-8 flex w-full flex-row items-center"
			class:justify-between={calendars.activeEvent}
			class:justify-end={!calendars.activeEvent}
		>
			{#if calendars.activeEvent}
				<TextButton title={ts.get.calendar.delete_entry} onclick={onDelete} type="danger" />
			{/if}
			<TextButton title={ts.get.layout.save} onclick={onsubmit} />
		</div>
	</div>
</SlidingSideBar>

{#if showRecurrenceModal}
	<RecurrenceActionModal
		action={showRecurrenceModal}
		onThisOccurrence={() => (showRecurrenceModal === 'edit' ? doUpdate(true) : doDelete(true))}
		onAllOccurrences={() =>
			showRecurrenceModal === 'edit' ? doUpdate(false) : doDelete(false)}
		onCancel={() => (showRecurrenceModal = null)}
	/>
{/if}
