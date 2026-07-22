<script lang="ts">
	import logo from '$lib/assets/logo_cut.png';

	let { label } = $props<{ label?: string }>();
</script>

<div class="flex items-center justify-center gap-2">
	<img src={logo} alt="logo" class="size-16 animate-bounce" />
	{#if label}
		<span
			class="animate-pulse text-c-heading text-shadow-2xs text-shadow-white dark:text-c-primary"
			>{label}</span
		>
	{/if}
</div>
