<script lang="ts">
	import IconPen from '@lucide/svelte/icons/pen';

	let { onClick } = $props<{
		onClick: (e: MouseEvent) => void | Promise<void>;
	}>();
</script>

<div
	class="group relative z-40 flex size-[34px] cursor-pointer items-center justify-center rounded-full border-c-neutral-3 text-c-btn drop-shadow-md transition-all hover:drop-shadow-xl"
>
	<button
		class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-c-btn text-white opacity-0 transition-all group-hover:opacity-100 hover:shadow-sm"
		onclick={onClick}
	>
		<IconPen class="size-5" />
	</button>
	<IconPen class="size-5" />
</div>
