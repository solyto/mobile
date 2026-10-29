<script lang="ts">
	import IconFilePlus from '@lucide/svelte/icons/file-plus';

	let { onClick }: {
		onClick: () => void;
	} = $props();
</script>

<button
	class="z-40 cursor-pointer rounded-full bg-c-btn p-[7px] text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	onclick={onClick}
>
	<IconFilePlus class="size-5" />
</button>
