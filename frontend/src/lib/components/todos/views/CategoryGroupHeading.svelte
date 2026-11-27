<script lang="ts">
	let { title, count }: { title: string; count: number } = $props();
</script>

<h3 class="mb-3 text-lg font-bold text-c-neutral-7 dark:text-c-neutral-3">
	{title}
	<span class="ml-2 text-sm font-normal text-c-neutral-4 dark:text-c-neutral-5">
		{count}
	</span>
</h3>
