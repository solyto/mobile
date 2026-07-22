<script lang="ts">
	let {
		height = 2,
		my = 4,
		width = '100%'
	} = $props<{
		height?: number;
		my?: number;
		width?: string;
	}>();
</script>

<div class="my-{my} bg-c-neutral dark:bg-s-dark-3" style="width: {width}; height: {height}px;"></div>

<!-- my-2 my-4 my-8 w-1/5 -->
