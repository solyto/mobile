<script lang="ts">
	import IconPlus from '@lucide/svelte/icons/plus';

	let { onClick, colorOnHover = false } = $props<{
		onClick: Function;
		colorOnHover?: boolean;
	}>();
</script>

{#if colorOnHover}
	<div
		class="group relative z-40 flex size-[34px] cursor-pointer items-center justify-center rounded-full border-c-neutral-3 text-c-neutral-4 transition-all"
	>
		<button
			class="absolute flex h-0 w-0 cursor-pointer items-center justify-center rounded-full bg-c-btn text-white transition-all group-hover:h-full group-hover:w-full hover:shadow-sm"
			onclick={onClick}
		>
			<IconPlus class="size-5" />
		</button>
		<IconPlus class="size-5" />
	</div>
{:else}
	<button
		class="z-40 cursor-pointer rounded-full bg-c-btn p-[7px] text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
		onclick={onClick}
	>
		<IconPlus class="size-5" />
	</button>
{/if}
