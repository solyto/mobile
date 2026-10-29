<script lang="ts">
	import IconImport from '@lucide/svelte/icons/import';

	let { onClick, title = '' }: {
		onClick: () => void;
		title?: string;
	} = $props();
</script>

<button
	class="z-40 flex size-[34px] cursor-pointer items-center justify-center rounded-full bg-c-action text-c-action-icon drop-shadow-md transition-all hover:text-c-action-icon-hover hover:drop-shadow-xl"
	onclick={onClick}
	{title}
>
	<IconImport class="size-5" />
</button>
