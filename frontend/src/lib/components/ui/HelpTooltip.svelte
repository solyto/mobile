<script lang="ts">
	import IconCircleQuestionMark from '@lucide/svelte/icons/circle-question-mark';
	import MovableHoverBox from '$lib/components/ui/MovableHoverBox.svelte';

	let { label, description, labelSize = 'xs' } = $props<{
		label: string;
		description: string;
		size?: string;
	}>();

	let showTooltip = $state<boolean>(false);
	let tooltipX = $state<number>(0);
	let tooltipY = $state<number>(0);

	function setPosition(e: MouseEvent) {
		tooltipX = e.clientX;
		tooltipY = e.clientY;
	}
</script>

<div
	role="button"
	tabindex="0"
	onmouseover={() => (showTooltip = true)}
	onmouseout={() => (showTooltip = false)}
	onfocus={() => (showTooltip = true)}
	onblur={() => (showTooltip = false)}
	onmousemove={(e) => setPosition(e)}
>
	<div class="flex items-center gap-1">
		<span class="text-{labelSize}">{label}</span>
		<IconCircleQuestionMark size={16} />
	</div>
	<MovableHoverBox
		content={description}
		show={showTooltip}
		x={tooltipX}
		y={tooltipY}
	/>
</div>