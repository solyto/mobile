<script lang="ts">
	import { setStatistics } from '$lib/state/Statistics.svelte';
	import AdminHomePage from '../../../src/routes/admin/+page.svelte';

	setStatistics();
</script>

<AdminHomePage />
