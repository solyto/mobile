<script lang="ts">
	import GameCreate from '$lib/components/libraries/games/GameCreate.svelte';
	import { setGameLibrary } from '$lib/state/GameLibrary.svelte';
	import { setTags } from '$lib/state/Tags.svelte';
	import { setIntegrations } from '$lib/state/Integrations.svelte';

	setGameLibrary().loadGenres();
	setTags().load();
	setIntegrations();
</script>

<GameCreate />
