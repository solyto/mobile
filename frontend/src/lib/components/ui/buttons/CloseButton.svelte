<script lang="ts">
	import IconX from '@lucide/svelte/icons/x';

	let { onClick, inModal = true } = $props<{
		onClick: () => void | Promise<void>;
		inModal?: boolean;
	}>();
</script>

<button
	class="z-40 flex size-[34px] cursor-pointer items-center justify-center rounded-full bg-c-action p-1 text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	class:absolute={inModal}
	class:right-4={inModal}
	class:top-4={inModal}
	onclick={onClick}
>
	<IconX />
</button>
