<script lang="ts">
	let {
		label,
		children,
		headerAction = null
	} = $props<{
		label: string;
		children?: any;
		headerAction?: any;
	}>();
</script>

<div class="w-full">
	<div class="mb-4 flex items-center justify-between">
		<span class="text-2xl leading-loose tracking-wide font-bold text-c-heading dark:text-c-primary">{label}</span>
		{#if headerAction !== null}
			{@render headerAction()}
		{/if}
	</div>
	{#if children !== undefined}
		{@render children()}
	{/if}
</div>
