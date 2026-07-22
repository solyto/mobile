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

<div
	class="mx-1 flex h-full w-7/8 items-end rounded-2xl rounded-tl-none rounded-tr-none border-1 border-c-neutral-3 dark:border-c-neutral0"
>
	<div class="w-full {getFill()} rounded-xl rounded-tl-none rounded-tr-none bg-blue-300"></div>
</div>
