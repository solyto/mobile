<script lang="ts">
	let { fill } = $props<{ fill: 0 | 25 | 50 | 75 | 100 }>();

	const id = Math.random().toString(36).slice(2, 8);
	const gradientId = `mg-${id}`;
	const clipId = `dc-${id}`;

	const fillMap: Record<0 | 25 | 50 | 75 | 100, number> = { 0: 0, 25: 18, 50: 36, 75: 58, 100: 100 };
	const pct = $derived(fillMap[fill as 0 | 25 | 50 | 75 | 100]);
	const rectY = $derived((1 - pct / 100) * 24);
	const rectH = $derived((pct / 100) * 24);
</script>

<svg viewBox="0 0 24 24" class="size-full" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id={gradientId} x1="0" y1="2" x2="0" y2="22" gradientUnits="userSpaceOnUse">
			<stop offset="0%" stop-color="#fce7f3" />
			<stop offset="100%" stop-color="#bb0a1e" />
		</linearGradient>
		<clipPath id={clipId}>
			<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
		</clipPath>
	</defs>
	<path
		d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
		fill="#fce7f3"
	/>
	{#if fill > 0}
		<rect
			x="0"
			y={rectY}
			width="24"
			height={rectH}
			fill="url(#{gradientId})"
			clip-path="url(#{clipId})"
		/>
	{/if}
</svg>
