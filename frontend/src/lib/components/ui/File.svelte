<script lang="ts">
	let {
		title = null,
		hover = true,
		noShadowOnMobile = false,
		children
	} = $props<{
		title?: string;
		hover?: boolean;
		noShadowOnMobile?: boolean;
		children?: any;
	}>();
</script>

<div
	class="relative flex h-36 w-full flex-col gap-2 rounded-md p-3 text-left shadow-sm transition-all md:h-40 dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
	class:max-md:shadow-none={noShadowOnMobile}
	class:dark:hover:bg-s-dark-3={hover}
	class:hover:bg-c-neutral={hover}
>
	<h3 class="font-bold">{title}</h3>
	{@render children?.()}
</div>
