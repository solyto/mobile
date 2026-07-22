<script lang="ts">
	import IconChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';

	let { onClick } = $props<{
		onClick: (e: MouseEvent) => void | Promise<void>;
	}>();
</script>

<div
	class="group relative z-40 flex size-[34px] cursor-pointer items-center justify-center rounded-full border-c-neutral-3 text-c-action drop-shadow-md transition-all hover:drop-shadow-xl"
>
	<button
		class="absolute flex h-0 w-0 cursor-pointer items-center justify-center rounded-full bg-c-action text-white transition-all group-hover:h-full group-hover:w-full hover:shadow-sm"
		onclick={onClick}
	>
		<IconChevronsUpDown class="size-5" />
	</button>
	<IconChevronsUpDown class="size-5" />
</div>
