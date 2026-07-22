<script lang="ts">
	import IconFolderPlus from '@lucide/svelte/icons/folder-plus';

	let { onClick } = $props<{
		onClick: Function;
	}>();
</script>

<button
	class="z-40 cursor-pointer rounded-full bg-c-btn p-[7px] text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	onclick={onClick}
>
	<IconFolderPlus class="size-5" />
</button>
