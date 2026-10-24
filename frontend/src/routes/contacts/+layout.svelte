<script lang="ts">
	import { setContacts } from '$lib/state/Contacts.svelte';

	setContacts();

	let { children } = $props();
</script>

{@render children?.()}
