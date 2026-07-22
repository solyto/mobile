<script lang="ts">
	import IconImport from '@lucide/svelte/icons/import';

	let { onClick, title = '' } = $props<{
		onClick: Function;
		title?: string;
	}>();
</script>

<button
	class="z-40 flex size-[34px] cursor-pointer items-center justify-center rounded-full bg-c-action text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	onclick={onClick}
	{title}
>
	<IconImport class="size-5" />
</button>
