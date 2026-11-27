<script lang="ts">
	import { onDestroy } from 'svelte';
	import { setContacts } from '$lib/state/Contacts.svelte';
	import { setContactImport } from '$lib/state/ContactImport.svelte';

	setContacts();
	const contactImport = setContactImport();

	let { children } = $props();

	onDestroy(() => contactImport.destroy());
</script>

{@render children?.()}
