<script lang="ts">
	let { fill } = $props<{ fill: 0 | 25 | 50 | 75 | 100 }>();

	function getFill(): string {
		switch (fill) {
			case 0:
			default:
				return 'h-0';
			case 25:
				return 'h-1/4';
			case 50:
				return 'h-1/2';
			case 75:
				return 'h-3/4';
			case 100:
				return 'h-full';
		}
	}
</script>

<div class="relative flex size-16 items-end">
	<div
		class="border-surface-700 absolute bottom-0 left-0 z-30 h-full w-full rounded-full border-2"
	></div>
	<div
		class="absolute top-[-16px] left-[-16px] z-20 size-24 rounded-full border-16 border-white bg-transparent"
	></div>
	<div class="absolute bottom-0 left-0 w-full {getFill()} z-10 bg-stone-500"></div>
</div>
