<script lang="ts">
	import IconPen from '@lucide/svelte/icons/pen';

	let {
		onClick,
		title = '',
		inModal = true
	} = $props<{
		onClick: Function;
		title?: string;
		inModal?: boolean;
	}>();
</script>

<button
	class="z-40 flex size-[34px] cursor-pointer items-center justify-center rounded-full bg-c-btn text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	class:absolute={inModal}
	class:top-20={inModal}
	class:right-4={inModal}
	onclick={onClick}
	{title}
>
	<IconPen class="size-5" />
</button>
