<script lang="ts">
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import CalendarEdit from '$lib/components/calendars/CalendarEdit.svelte';
	import PendingCalendarInvite from '$lib/components/calendars/PendingCalendarInvite.svelte';
	import IconChevronLeft from '@lucide/svelte/icons/chevron-left';
	import CalendarCreate from '$lib/components/calendars/CalendarCreate.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import IconGripVertical from '@lucide/svelte/icons/grip-vertical';
	import type { Calendar } from '$lib/types/calendar';

	let { onClose } = $props<{ onClose: () => void }>();

	const calendars = getCalendars();
	const ts = getTranslation();

	const flipDurationMs = 200;
	let items = $state<Calendar[]>([]);
	let dragDisabled = $state(true);

	$effect(() => {
		items = [...calendars.ownedCalendars, ...calendars.acceptedSharedCalendars];
	});

	function handleConsider(e: CustomEvent) {
		items = e.detail.items;
	}

	async function handleFinalize(e: CustomEvent) {
		items = e.detail.items;
		dragDisabled = true;
		await calendars.updateCalendarsOrder(items.map((cal) => cal.id));
	}
</script>

<div class="flex h-full w-full flex-col justify-center gap-2 p-4">
	<button
		onclick={onClose}
		class="cursor-pointer self-center rounded-full bg-c-neutral p-2 transition-all hover:bg-white dark:bg-s-dark-3 dark:hover:bg-s-dark-2"
	>
		<IconChevronLeft class="h-6 w-6" />
	</button>
	{#if calendars.pendingInvites.length > 0}
		<p class="px-1 text-xs font-semibold uppercase tracking-wider text-c-neutral-4">
			{ts.get.calendar.pending_invites}
		</p>
		<div class="flex flex-col gap-2">
			{#each calendars.pendingInvites as calendar (calendar.id)}
				<PendingCalendarInvite {calendar} />
			{/each}
		</div>
		<Divider />
	{/if}
	<div
		class="flex flex-col gap-2 !outline-0"
		use:dndzone={{
			items,
			flipDurationMs,
			dragDisabled,
			dropTargetClasses: ['shadow-lg', 'ring-2', 'ring-d-lightblue']
		}}
		onconsider={handleConsider}
		onfinalize={handleFinalize}
	>
		{#each items as calendar (calendar.id)}
			<div class="flex items-center gap-1" animate:flip={{ duration: flipDurationMs }}>
				<IconGripVertical
					size={20}
					class="shrink-0 cursor-grab text-c-neutral-3"
					onpointerdown={() => (dragDisabled = false)}
					onpointerup={() => (dragDisabled = true)}
				/>
				<CalendarEdit {calendar} />
			</div>
		{/each}
	</div>
	<CalendarCreate />
</div>
