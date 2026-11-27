<script lang="ts">
	import ColorPicker from '$lib/components/forms/ColorPicker.svelte';

	let hex = $state('#00ff00');
	let isOpen = $state(false);
</script>

<ColorPicker bind:hex bind:isOpen />
<span data-testid="hex">{hex}</span>
<span data-testid="open">{isOpen}</span>
