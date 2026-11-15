<script lang="ts">
	let { value, label }: { value: number; label?: string } = $props();
</script>

<div
	class="h-4 w-full rounded-lg border-1 border-c-primary shadow-sm"
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={Math.round(value * 100)}
	aria-label={label}
>
	<div class="h-full rounded-lg bg-c-primary transition-all duration-1000" style="width: {value * 100}%;"></div>
</div>
