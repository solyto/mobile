<script lang="ts">
	import IconStar from '@lucide/svelte/icons/star';

	let { onClick, selected } = $props<{
		onClick: (e: MouseEvent) => void | Promise<void>;
		selected?: boolean;
	}>();
</script>

<div
	class="group relative z-40 flex size-[34px] cursor-pointer items-center justify-center rounded-full border-c-neutral-3 text-c-neutral-3 transition-all"
>
	<button
		class="absolute flex h-0 w-0 cursor-pointer items-center justify-center rounded-full bg-c-warning text-white transition-all group-hover:h-full group-hover:w-full hover:shadow-sm"
		class:w-full={selected}
		class:h-full={selected}
		onclick={onClick}
	>
		<IconStar class="size-5" />
	</button>
	<IconStar class="size-5" />
</div>
