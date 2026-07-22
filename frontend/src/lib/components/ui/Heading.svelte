<script lang="ts">
	let {
		title,
		my,
		mt = 0,
		mb = 0,
		bold = false
	} = $props<{ title: string; my: number; mt?: number; mb?: number; bold?: boolean }>();
</script>

<div class="text-2xl md:text-3xl my-{my} mt-{mt} mb-{mb}" class:font-bold={bold}>
	{title}
</div>

<!-- mt-4 mt-8 mt-12 my-2 my-4 my-8 mb-2 mb-4 mb-8 mb-12 -->
