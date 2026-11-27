<script lang="ts">
	let { name, class: customClass = '' }: { name: string | null; class?: string } = $props();
</script>

<!-- All icon drawings live in one static sprite, loaded only once a custom icon is shown. -->
<svg
	class={customClass}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name}
		<use href="/icons/lucide-sprite.svg#{name}" />
	{:else}
		<circle cx="12" cy="12" r="9" opacity="0.4" />
	{/if}
</svg>
