<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import type { Calendar } from '$lib/types/calendar.js';
	import IconCheck from '@lucide/svelte/icons/check';
	import IconX from '@lucide/svelte/icons/x';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const calendars = getCalendars();
	const notifications = getUiNotifications();

	let { calendar } = $props<{ calendar: Calendar }>();

	let processing = $state<boolean>(false);

	async function accept(): Promise<void> {
		if (!calendar.share_token) return;

		processing = true;
		loadingIndicator.start();

		const success = await calendars.acceptInvite(calendar.share_token);

		if (success) {
			notifications.add({
				type: 'success',
				message: ts.get.calendar.invite_accepted
			});
		}

		loadingIndicator.stop();
		processing = false;
	}

	async function decline(): Promise<void> {
		if (!calendar.share_token) return;

		processing = true;
		loadingIndicator.start();

		const success = await calendars.declineInvite(calendar.share_token);

		if (success) {
			notifications.add({
				type: 'success',
				message: ts.get.calendar.invite_declined
			});
		}

		loadingIndicator.stop();
		processing = false;
	}
</script>

<div class="flex w-full items-center gap-3 rounded-lg p-2">
	<div
		class="size-3 shrink-0 rounded-full"
		style="background-color: {calendar.color}"
	></div>
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-medium">{calendar.name}</p>
		{#if calendar.share_owner}
			<p class="truncate text-xs text-c-neutral-5">
				{ts.get.calendar.shared_by.replace('%s', calendar.share_owner)}
			</p>
		{/if}
	</div>
	<div class="flex shrink-0 items-center gap-1">
		<button
			class="cursor-pointer rounded-full p-1.5 text-c-neutral-4 transition-colors hover:bg-c-neutral-2 hover:text-c-primary disabled:opacity-50 dark:hover:bg-s-dark-2"
			onclick={accept}
			disabled={processing}
			title={ts.get.calendar.accept_invite}
		>
			<IconCheck class="size-3.5" />
		</button>
		<button
			class="cursor-pointer rounded-full p-1.5 text-c-neutral-4 transition-colors hover:bg-c-neutral-2 hover:text-c-danger disabled:opacity-50 dark:hover:bg-s-dark-2"
			onclick={decline}
			disabled={processing}
			title={ts.get.calendar.decline_invite}
		>
			<IconX class="size-3.5" />
		</button>
	</div>
</div>
