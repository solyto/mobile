<script lang="ts">
	import IconPlus from '@lucide/svelte/icons/plus';
	import IconFilePlus from '@lucide/svelte/icons/file-plus';

	let { onClick } = $props<{
		onClick: Function;
	}>();
</script>

<button
	class="z-40 cursor-pointer rounded-full bg-c-btn p-[7px] text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	onclick={onClick}
>
	<IconFilePlus class="size-5" />
</button>
