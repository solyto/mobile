<script lang="ts">
	let {
		title,
		my,
		mt = 0,
		mb = 0,
		bold = false
	}: { title: string; my: number; mt?: number; mb?: number; bold?: boolean } = $props();
</script>

<div class="text-2xl my-{my} mt-{mt} mb-{mb}" class:font-bold={bold}>
	{title}
</div>

<!-- mt-4 mt-6 mt-8 mt-12 my-2 my-4 my-8 mb-2 mb-4 mb-6 mb-8 mb-12 -->
