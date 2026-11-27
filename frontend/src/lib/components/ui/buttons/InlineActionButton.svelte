<script lang="ts">
	import type { Component } from 'svelte';

	let { onClick, label = null, icon: Icon, color, fill, class: customClass = '' }: {
		onClick: (e: MouseEvent) => void | Promise<void>;
		label?: string | null;
		icon: Component<{ class?: string }>;
		color: string;
		fill: string;
		class?: string;
	} = $props();
</script>

<button
	type="button"
	aria-label={label ?? undefined}
	title={label ?? undefined}
	class="group relative z-40 flex size-[34px] cursor-pointer items-center justify-center rounded-full {color} drop-shadow-md transition-all hover:drop-shadow-xl {customClass}"
	onclick={onClick}
>
	<span class="absolute h-0 w-0 rounded-full {fill} transition-all group-hover:h-full group-hover:w-full group-focus-visible:h-full group-focus-visible:w-full"></span>
	<Icon class="relative size-5 transition-colors group-hover:text-white group-focus-visible:text-white" />
</button>
