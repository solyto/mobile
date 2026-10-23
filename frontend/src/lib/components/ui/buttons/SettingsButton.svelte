<script lang="ts">
	import IconSettings from '@lucide/svelte/icons/settings';

	let {
		onclick,
		title,
		class: customClass = ''
	}: {
		onclick: () => void;
		title: string;
		class?: string;
	} = $props();
</script>

<button
	class="cursor-pointer rounded-lg p-2 transition-all hover:bg-c-neutral-1 dark:hover:bg-s-dark-3 {customClass}"
	{onclick}
	{title}
>
	<IconSettings class="size-5" />
</button>
