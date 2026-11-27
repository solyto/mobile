<script lang="ts">
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import GhostIconButton from '$lib/components/ui/buttons/GhostIconButton.svelte';
	import IconPlus from '$lib/icons/lucide/plus.svelte';
	import IconKeyRound from '$lib/icons/lucide/key-round.svelte';
	import { getExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { pluralize } from '$lib/helpers/FormatHelper';
	import type { ExternalCalendarAccount } from '$lib/types/calendar';

	let { account }: { account: ExternalCalendarAccount } = $props();

	const externalCalendars = getExternalCalendars();
	const ts = getTranslation();

	function calendarCount(): string {
		const count = externalCalendars.connectedCount(account);
		return pluralize(count, ts.get.calendar.account_calendars_singular, ts.get.calendar.account_calendars_plural);
	}

	function addCalendars(): void {
		externalCalendars.openDialog({ step: 'calendars', account });
	}

	function changePassword(): void {
		externalCalendars.openDialog({ step: 'credentials', account });
	}

	function remove(): void {
		externalCalendars.askToRemove(account);
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
				<GhostIconButton onclick={addCalendars} label={ts.get.calendar.account_add_calendars} class="max-md:size-11">
					<IconPlus class="size-4" />
				</GhostIconButton>
			{/if}
			<GhostIconButton onclick={changePassword} label={ts.get.calendar.account_change_password} class="max-md:size-11">
				<IconKeyRound class="size-4" />
			</GhostIconButton>
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
