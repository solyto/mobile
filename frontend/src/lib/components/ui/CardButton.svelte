<script lang="ts">
	let {
		label = null,
		icon = null,
		children
	} = $props<{
		label?: string;
		icon?: any;
		hover?: boolean;
		children?: any;
	}>();
</script>

<div
	class="relative h-auto rounded-md shadow-sm transition-all dark:shadow-s-dark-shadow md:dark:bg-s-dark-2 px-6 py-4 hover:bg-c-neutral dark:hover:bg-s-dark-3"
>
	{#if label !== null}
		<div
			class="flex flex-row items-center justify-between w-full gap-4 pb-2 text-xl leading-loose tracking-wide text-c-heading dark:text-c-primary"
			class:gap-2={!icon}
			class:mt-[-10px]={!icon}
			class:mb-2={children !== undefined}
			class:pb-2={children !== undefined}
		>
			<span>{label}</span>
			{#if icon !== null}
				{@render icon({ class: 'w-6 h-6' })}
			{/if}
		</div>
	{/if}
	{#if children !== undefined}
		{@render children?.()}
	{/if}
</div>