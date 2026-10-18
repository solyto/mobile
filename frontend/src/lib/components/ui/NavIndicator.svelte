<script lang="ts">
	let { active }: { active: boolean } = $props();
</script>

<span
	class="absolute top-1/2 right-0 h-6 w-1 -translate-y-1/2 rounded-l-full bg-c-btn transition-all"
	class:opacity-0={!active}
></span>
