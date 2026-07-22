<script lang="ts">
	let {
		label = null,
		fixedWidth = true,
		fullWidth = false,
		href = null,
		icon = null,
		hover = true,
		noShadowOnMobile = false,
		children
	} = $props<{
		label?: string;
		fixedWidth?: boolean;
		fullWidth?: boolean;
		href?: string | null;
		icon?: any;
		hover?: boolean;
		noShadowOnMobile?: boolean;
		children?: any;
	}>();
</script>

{#snippet cardBody()}
	{#if label !== null}
		<div
			class="flex flex-row items-center gap-4 pb-2 text-xl leading-loose tracking-wide text-c-heading dark:text-c-primary"
			class:gap-2={!icon}
			class:mt-[-10px]={!icon}
			class:mb-2={children !== undefined}
			class:pb-2={children !== undefined}
		>
			{#if icon !== null}
				{@render icon({ class: 'w-6 h-6' })}
			{/if}
			<span>{label}</span>
		</div>
	{/if}
	{#if children !== undefined}
		{@render children?.()}
	{/if}
{/snippet}

{#if href !== null}
	<a
		{href}
		class="relative h-auto rounded-md shadow-sm transition-all dark:shadow-s-dark-shadow md:dark:bg-s-dark-2 {fixedWidth
			? 'p-4'
			: 'p-8'}"
		class:max-md:shadow-none={noShadowOnMobile}
		class:dark:hover:bg-s-dark-3={hover}
		class:hover:bg-d-lighterblue={hover}
		class:md:w-106={fixedWidth && !fullWidth}
		class:w-full={fixedWidth}
	>
		{@render cardBody()}
	</a>
{:else}
	<div
		class="relative h-auto rounded-md shadow-sm transition-all dark:shadow-s-dark-shadow md:dark:bg-s-dark-2 {fixedWidth
			? 'p-4'
			: 'p-8'}"
		class:max-md:shadow-none={noShadowOnMobile}
		class:dark:hover:bg-s-dark-3={hover}
		class:hover:bg-c-neutral={hover}
		class:md:w-106={fixedWidth && !fullWidth}
		class:w-full={fixedWidth}
	>
		{@render cardBody()}
	</div>
{/if}
