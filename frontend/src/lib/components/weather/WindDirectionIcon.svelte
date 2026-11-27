<script lang="ts">
	import IconMoveUp from '$lib/icons/lucide/move-up.svelte';
	import { onMount } from 'svelte';

	let { angle }: { angle: number } = $props();
	let rotationAngle = $state<number>(0);

	onMount(() => {
		setTimeout(() => {
			rotationAngle = angle;
		}, 500);
	});
</script>

<IconMoveUp
	class="h-5 w-5"
	style="transform: rotate({rotationAngle}deg); transition: transform 0.5s ease-out;"
/>
