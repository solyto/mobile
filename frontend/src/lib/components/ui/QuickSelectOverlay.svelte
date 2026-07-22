<script lang="ts">
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { fade } from 'svelte/transition';

	let {
		onClose,
		children,
		class: className = '',
		p = null
	} = $props<{
		onClose: () => void;
		children?: any;
		class?: string;
		p?: number;
	}>();
</script>

<div
	use:clickOutside={onClose}
	transition:fade={{ duration: 200 }}
	class="absolute top-0 z-50 flex flex-col gap-2 rounded-lg bg-white drop-shadow-lg dark:bg-s-dark-2 {p !== null ? 'p-' + p : 'p-4'} {className}"
>
	{@render children?.()}
</div>
