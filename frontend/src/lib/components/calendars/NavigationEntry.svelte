<script lang="ts">
	import type { Calendar } from '$lib/types/calendar';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconUsers from '@lucide/svelte/icons/users';

	const calendars = getCalendars();
	const ts = getTranslation();

	let { calendar } = $props<{ calendar: Calendar }>();
	let hidden = $derived(calendars.isCalendarHidden(calendar.id));

	function getBorderColor(): string {
		if (hidden || !calendar.color) return 'var(--color-c-neutral-2)';
		return calendar.color ?? 'var(--color-c-neutral-2)';
	}

	function getBgColor(): string {
		if (hidden || !calendar.color) return 'transparent';
		return calendar.color ? `color-mix(in srgb, ${calendar.color} 25%, var(--color-c-bg-elevated))` : '';
	}

	function getTitle(): string {
		if (calendar.is_shared && calendar.share_owner) {
			return ts.get.calendar.shared_by.replace('%s', calendar.share_owner);
		}
		return ts.get.layout.toggle;
	}
</script>

<button
	class="relative my-1 flex max-md:min-w-8 cursor-pointer items-center justify-center rounded-full border-c-neutral-1 transition-all duration-100 dark:!bg-s-dark-3"
	class:border-l-4={!hidden}
	class:border-r-4={hidden}
	style="border-color: {getBorderColor()}; background-color: {getBgColor()};"
	onclick={() => calendars.toggleCalendar(calendar.id)}
	title={getTitle()}
>
	{calendar.name ? calendar.name.slice(0, 1) : ''}
	{#if calendar.is_shared}
		<span class="absolute -right-0.5 -bottom-0.5 rounded-full bg-c-bg-surface p-0.5">
			<IconUsers class="size-2.5 text-c-neutral-4" />
		</span>
	{/if}
</button>
