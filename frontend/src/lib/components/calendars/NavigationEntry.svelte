<script lang="ts">
	import type { Calendar } from '$lib/types/calendar';
	import type { Component } from 'svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconUsers from '$lib/icons/lucide/users.svelte';
	import IconCloud from '$lib/icons/lucide/cloud.svelte';
	import IconCloudOff from '$lib/icons/lucide/cloud-off.svelte';
	import IconKeyRound from '$lib/icons/lucide/key-round.svelte';
	import { getEventBackgroundColor, getEventBorderColor } from '$lib/helpers/ColorHelper';

	const calendars = getCalendars();
	const ts = getTranslation();

	let { calendar }: { calendar: Calendar } = $props();
	let hidden = $derived(calendars.isCalendarHidden(calendar.id));
	let status = $derived(calendars.calendarStatus(calendar));

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
		switch (status) {
			case 'credentials_rejected':
				return withStatus(ts.get.calendar.external_credentials_rejected);
			case 'unavailable':
				return withStatus(ts.get.calendar.external_unavailable);
			case 'external':
				return withStatus(ts.get.calendar.external_calendar);
			case 'shared':
				return calendar.share_owner ? ts.get.calendar.shared_by.replace('%s', calendar.share_owner) : ts.get.layout.toggle;
			default:
				return ts.get.layout.toggle;
		}
	}

	function toggle(): void {
		calendars.toggleCalendar(calendar.id);
	}
</script>

{#snippet badge(Icon: Component<{ class?: string }>, iconClass: string, label: string | null)}
	<span class="absolute -right-0.5 -bottom-0.5 rounded-full bg-c-bg p-0.5">
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
	style="
		border-color: {getBorderColor()};
		background-color: {getBgColor()};
	"
	onclick={toggle}
	title={getTitle()}
>
	{calendar.name ? calendar.name.slice(0, 1) : ''}
	{#if status === 'credentials_rejected'}
		{@render badge(IconKeyRound, 'text-c-danger', ts.get.calendar.external_credentials_rejected)}
	{:else if status === 'unavailable'}
		{@render badge(IconCloudOff, 'text-c-danger', ts.get.calendar.external_unavailable)}
	{:else if status === 'external'}
		{@render badge(IconCloud, 'text-c-neutral-4', ts.get.calendar.external_calendar)}
	{:else if status === 'shared'}
		{@render badge(IconUsers, 'text-c-neutral-4', null)}
	{/if}
</button>
