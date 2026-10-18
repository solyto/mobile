<script lang="ts">
	import { getCalendarDrag } from '$lib/state/CalendarDrag.svelte';
	import { getEventBackgroundColor, getEventBorderColor } from '$lib/helpers/ColorHelper';

	const drag = getCalendarDrag();

	function isGhostVisible(): boolean {
		return drag.active && drag.event !== null && drag.ghost !== null;
	}

	function ghostStyle(): string {
		const { ghost, event } = drag;
		if (!ghost || !event) return '';

		return [
			`left: ${ghost.x}px`,
			`top: ${ghost.y}px`,
			`width: ${ghost.width}px`,
			`height: ${ghost.height}px`,
			`border-color: ${getEventBorderColor(event.calendar_color)}`,
			`background-color: ${getEventBackgroundColor(event.calendar_color)}`
		].join('; ');
	}
</script>

{#if isGhostVisible()}
	<div
		class="pointer-events-none fixed z-[100] flex items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm shadow-lg select-none"
		style={ghostStyle()}
	>
		<span class="truncate text-left">{drag.event?.title}</span>
	</div>
{/if}
