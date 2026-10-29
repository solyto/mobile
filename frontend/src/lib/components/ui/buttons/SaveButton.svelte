<script lang="ts">
	import IconSave from '@lucide/svelte/icons/save';

	let { onClick }: {
		onClick: () => void;
	} = $props();
</script>

<button
	class="z-40 cursor-pointer rounded-full bg-c-success p-[7px] text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	onmousedown={(e) => e.preventDefault()}
	onclick={onClick}
>
	<IconSave class="size-5" />
</button>
