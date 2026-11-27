<script lang="ts">
	import type { Component } from 'svelte';

	let {
		onClick,
		title,
		icon: Icon,
		fill,
		iconClass
	}: {
		onClick: (e: MouseEvent) => void | Promise<void>;
		title: string;
		icon: Component<{ class?: string }>;
		fill: string;
		iconClass: string;
	} = $props();
</script>

<button
	type="button"
	class="group relative flex size-[34px] cursor-pointer items-center justify-center rounded-full text-c-neutral-3"
	onclick={onClick}
	{title}
	aria-label={title || undefined}
>
	<span class="absolute h-0 w-0 rounded-full {fill} transition-all group-hover:h-full group-hover:w-full group-focus-visible:h-full group-focus-visible:w-full"></span>
	<Icon class="relative {iconClass} transition-colors group-hover:text-white group-focus-visible:text-white" />
</button>
