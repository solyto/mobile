<script lang="ts">
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import ColorPicker from 'svelte-awesome-color-picker';
	import type { Calendar, UpdateCalendarRequest } from '$lib/types/calendar';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import IconShare2 from '@lucide/svelte/icons/share-2';

	const calendars = getCalendars();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();
	const notifications = getUiNotifications();

	let { calendar } = $props<{ calendar: Calendar }>();

	let hex = $state<string>(calendar.color !== null ? calendar.color : 'var(--color-c-neutral-2)');

	const isOwned = $derived(!calendar.is_shared && calendar.invite_status === null);

	async function onColorChange(): Promise<void> {
		if (hex === calendar.color) return;
		if (hex === null) return;

		loadingIndicator.start();
		const request: UpdateCalendarRequest = { color: hex };
		await calendars.updateCalendarColor(calendar, request);
		loadingIndicator.stop();
	}

	function onDelete(): void {
		calendars.selectedCalendar = calendar;
		calendars.deletionModal = true;
	}

	function onShare(): void {
		calendars.openShareModal(calendar);
	}

	async function onUnsubscribe(): Promise<void> {
		loadingIndicator.start();
		const success = await calendars.unsubscribeFromCalendar(calendar.id);
		if (success) {
			notifications.add({
				type: 'success',
				message: ts.get.calendar.unsubscribed
			});
		}
		loadingIndicator.stop();
	}

</script>

<div class="flex w-full items-center gap-4">
	<div use:clickOutside={onColorChange}>
		<ColorPicker
			bind:hex
			position="responsive"
			nullable={false}
			label=""
			isTextInput={false}
			--cp-border-color="var(--color-c-neutral-2)"
		/>
	</div>
	<div class="flex flex-1 flex-col min-w-0">
		<span class="truncate text-md">{calendar.name}</span>
		{#if calendar.is_shared && calendar.share_owner}
			<span class="truncate text-xs text-c-neutral-4">{ts.get.calendar.shared_by.toLowerCase().replace('%s', calendar.share_owner)}</span>
		{/if}
	</div>
	<div class="flex items-center">
		{#if isOwned}
			<button
				class="cursor-pointer rounded-full p-2 text-c-neutral-4 transition-colors hover:bg-c-neutral-1 hover:text-c-primary dark:hover:bg-s-dark-3"
				onclick={onShare}
				title={ts.get.calendar.share_calendar}
			>
				<IconShare2 class="size-4" />
			</button>
			<InlineDeleteButton onClick={onDelete} />
		{:else if calendar.is_shared}
			<InlineDeleteButton onClick={onUnsubscribe} />
		{/if}
	</div>
</div>
