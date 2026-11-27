<script lang="ts">
	import IconCloudOff from '$lib/icons/lucide/cloud-off.svelte';
	import IconKeyRound from '$lib/icons/lucide/key-round.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { Calendar } from '$lib/types/calendar';

	let { class: customClass = '' }: { class?: string } = $props();

	const calendars = getCalendars();
	const externalCalendars = getExternalCalendars();
	const ts = getTranslation();

	function names(list: Calendar[]): string {
		return list.map((calendar) => calendar.name).join(', ');
	}

	function changePassword(): void {
		externalCalendars.changePasswordForCalendar(calendars.credentialsRejectedCalendars()[0].id);
	}
</script>

{#if calendars.credentialsRejectedCalendars().length > 0}
	<p class="flex items-center justify-center gap-1 text-xs text-c-danger {customClass}">
		<IconKeyRound class="size-3.5 shrink-0" />
		<span>{ts.get.calendar.external_credentials_rejected_notice.replace('%s', names(calendars.credentialsRejectedCalendars()))}</span>
		<button class="shrink-0 cursor-pointer font-bold underline hover:opacity-80" onclick={changePassword}>
			{ts.get.calendar.account_change_password}
		</button>
	</p>
{/if}
{#if calendars.unreachableCalendars().length > 0}
	<p class="flex items-center justify-center gap-1 text-xs text-c-danger {customClass}">
		<IconCloudOff class="size-3.5 shrink-0" />
		{ts.get.calendar.external_unavailable_notice.replace('%s', names(calendars.unreachableCalendars()))}
	</p>
{/if}
