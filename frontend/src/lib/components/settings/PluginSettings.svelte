<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import AiPluginSettings from '$lib/components/settings/AiPluginSettings.svelte';

	const ts = getTranslation();
</script>

<div class="flex flex-wrap gap-4">
	<Card label={ts.get.settings.ai} hover={false}>
		<AiPluginSettings />
	</Card>
</div>
