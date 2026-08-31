<script lang="ts">
	import { calendarDrag } from './CalendarDragState.svelte';

	let { sourceDateSlug } = $props<{ sourceDateSlug: string }>();
</script>

{#if calendarDrag.active && calendarDrag.event && calendarDrag.ghost && calendarDrag.sourceDateSlug === sourceDateSlug}
	<div
		data-calendar-drag-ghost
		class="pointer-events-none fixed z-[100] flex items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm shadow-lg select-none"
		style="left: {calendarDrag.ghost.x}px; top: {calendarDrag.ghost.y}px; width: {calendarDrag
			.ghost.width}px; height: {calendarDrag.ghost.height}px; border-color: {calendarDrag
			.event.calendar_color ?? 'var(--color-c-neutral-2)'}; background-color: {calendarDrag
			.event.calendar_color
			? `color-mix(in srgb, ${calendarDrag.event.calendar_color} 25%, var(--color-c-bg-elevated))`
			: ''};"
	>
		<span class="truncate text-left">{calendarDrag.event.title}</span>
	</div>
{/if}
