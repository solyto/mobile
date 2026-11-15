<script lang="ts">
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconPlus from '@lucide/svelte/icons/plus';
	import IconKeyRound from '@lucide/svelte/icons/key-round';
	import { getExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { ExternalCalendarAccount } from '$lib/types/calendar';

	let { account }: { account: ExternalCalendarAccount } = $props();

	const externalCalendars = getExternalCalendars();
	const ts = getTranslation();
	const ACTION = 'flex cursor-pointer items-center justify-center rounded-full p-2 text-c-neutral-4 transition-colors hover:bg-c-neutral-1 hover:text-c-primary max-md:size-11 dark:hover:bg-s-dark-3';

	function calendarCount(): string {
		const count = externalCalendars.connectedCount(account);
		return count === 1
			? ts.get.calendar.account_calendars_singular
			: ts.get.calendar.account_calendars_plural.replace('{n}', String(count));
	}

	function addCalendars(): void {
		externalCalendars.openDialog({ step: 'calendars', account });
	}

	function changePassword(): void {
		externalCalendars.openDialog({ step: 'credentials', account });
	}

	function remove(): void {
		externalCalendars.removal = account;
	}
</script>

<div class="flex w-full flex-col gap-2 pl-1">
	<div class="flex w-full items-center gap-2">
		<div class="flex min-w-0 flex-1 flex-col">
			<span class="truncate text-md">{externalCalendars.service.host(account.server_url)}</span>
			<span class="truncate text-xs text-c-neutral-4">{account.username} · {calendarCount()}</span>
		</div>
		<div class="flex shrink-0 items-center">
			{#if externalCalendars.connectedCount(account) > 0}
				<button class={ACTION} onclick={addCalendars} title={ts.get.calendar.account_add_calendars} aria-label={ts.get.calendar.account_add_calendars}>
					<IconPlus class="size-4" />
				</button>
			{/if}
			<button class={ACTION} onclick={changePassword} title={ts.get.calendar.account_change_password} aria-label={ts.get.calendar.account_change_password}>
				<IconKeyRound class="size-4" />
			</button>
			<InlineDeleteButton onClick={remove} label={ts.get.calendar.account_remove} class="max-md:size-11" />
		</div>
	</div>
	{#if externalCalendars.connectedCount(account) === 0}
		<div class="flex items-center justify-between gap-2">
			<p class="text-xs text-c-neutral-4">{ts.get.calendar.account_no_calendars_hint}</p>
			<TextButton title={ts.get.calendar.account_add_calendars} type="slight" onclick={addCalendars} class="shrink-0" />
		</div>
	{/if}
</div>
