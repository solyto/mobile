<script lang="ts">
	import IconCloud from '$lib/icons/lucide/cloud.svelte';

	let { onClick, title }: {
		onClick: () => void;
		title: string;
	} = $props();
</script>

<button
	class="z-40 flex size-[34px] cursor-pointer items-center justify-center rounded-full bg-c-primary text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	onclick={onClick}
	{title}
>
	<IconCloud class="size-5" />
</button>
