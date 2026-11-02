<script lang="ts">
	let { active, edge = 'right', color = 'var(--color-c-btn)' }: {
		active: boolean;
		edge?: 'right' | 'bottom';
		color?: string;
	} = $props();

	const EDGE_CLASSES = {
		right: 'top-1/2 right-0 h-6 w-1 -translate-y-1/2 rounded-l-full',
		bottom: '-bottom-px left-1/2 h-1 w-6 -translate-x-1/2 rounded-t-full'
	};
</script>

<span
	class={['absolute transition-all', EDGE_CLASSES[edge]]}
	class:opacity-0={!active}
	style="background-color: {color};"
></span>
