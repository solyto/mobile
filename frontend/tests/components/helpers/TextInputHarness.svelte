<script lang="ts">
	import TextInput from '$lib/components/forms/TextInput.svelte';

	let value = $state('one');
</script>

<TextInput bind:value />
<span data-testid="value">{value}</span>
