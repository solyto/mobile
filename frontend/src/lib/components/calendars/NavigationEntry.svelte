<script lang="ts">
	import type { Calendar } from '$lib/types/calendar';
	import type { Component } from 'svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconUsers from '@lucide/svelte/icons/users';
	import IconCloud from '@lucide/svelte/icons/cloud';
	import IconCloudOff from '@lucide/svelte/icons/cloud-off';
	import IconKeyRound from '@lucide/svelte/icons/key-round';
	import { getEventBackgroundColor, getEventBorderColor } from '$lib/helpers/ColorHelper';

	const calendars = getCalendars();
	const ts = getTranslation();

	let { calendar }: { calendar: Calendar } = $props();
	let hidden = $derived(calendars.isCalendarHidden(calendar.id));

	function getBorderColor(): string {
		if (hidden || !calendar.color) return 'var(--color-c-neutral-2)';
		return getEventBorderColor(calendar.color);
	}

	function getBgColor(): string {
		if (hidden || !calendar.color) return 'transparent';
		return getEventBackgroundColor(calendar.color);
	}

	function withStatus(status: string): string {
		return ts.get.calendar.calendar_with_status.replace('{status}', status).replace('{name}', calendar.name);
	}

	function getTitle(): string {
		if (calendars.isCalendarCredentialsRejected(calendar.id)) {
			return withStatus(ts.get.calendar.external_credentials_rejected);
		}
		if (calendars.isCalendarUnavailable(calendar.id)) {
			return withStatus(ts.get.calendar.external_unavailable);
		}
		if (calendar.is_external) {
			return withStatus(ts.get.calendar.external_calendar);
		}
		if (calendar.is_shared && calendar.share_owner) {
			return ts.get.calendar.shared_by.replace('%s', calendar.share_owner);
		}
		return ts.get.layout.toggle;
	}
</script>

{#snippet badge(Icon: Component<{ class?: string }>, iconClass: string, label: string | null)}
	<span class="absolute -right-0.5 -bottom-0.5 rounded-full bg-c-bg-surface p-0.5">
		<Icon class="size-2.5 {iconClass}" />
		{#if label}
			<span class="sr-only">{label}</span>
		{/if}
	</span>
{/snippet}

<button
	class="relative my-1 flex max-md:min-w-8 cursor-pointer items-center justify-center rounded-full border-c-neutral-1 transition-all duration-100 dark:!bg-s-dark-3"
	class:border-l-4={!hidden}
	class:border-r-4={hidden}
	style="border-color: {getBorderColor()}; background-color: {getBgColor()};"
	onclick={() => calendars.toggleCalendar(calendar.id)}
	title={getTitle()}
>
	{calendar.name ? calendar.name.slice(0, 1) : ''}
	{#if calendars.isCalendarCredentialsRejected(calendar.id)}
		{@render badge(IconKeyRound, 'text-c-danger', ts.get.calendar.external_credentials_rejected)}
	{:else if calendars.isCalendarUnavailable(calendar.id)}
		{@render badge(IconCloudOff, 'text-c-danger', ts.get.calendar.external_unavailable)}
	{:else if calendar.is_external}
		{@render badge(IconCloud, 'text-c-neutral-4', ts.get.calendar.external_calendar)}
	{:else if calendar.is_shared}
		{@render badge(IconUsers, 'text-c-neutral-4', null)}
	{/if}
</button>
