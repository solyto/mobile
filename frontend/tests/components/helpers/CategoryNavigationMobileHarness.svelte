<script lang="ts">
	import CategoryNavigationMobile from '$lib/components/libraries/links/CategoryNavigationMobile.svelte';
	import { setLinkLibrary } from '$lib/state/LinkLibrary.svelte';

	setLinkLibrary().load();
</script>

<CategoryNavigationMobile />
