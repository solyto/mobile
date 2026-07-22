<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getClipboard } from '$lib/state/Clipboard.svelte';
	import ClipboardCreate from '$lib/components/clipboard/ClipboardCreate.svelte';
	import ClipboardList from '$lib/components/clipboard/ClipboardList.svelte';

	const clipboard = getClipboard();
	const loadingIndicator = getLoadingIndicator();

	onMount(async () => {
		loadingIndicator.start();
		await clipboard.load();
		loadingIndicator.stop();
	});
</script>

<div class="h-full w-full p-8">
	<div class="flex w-full flex-col gap-12 pb-8 md:flex-row">
		<ClipboardCreate />
		<ClipboardList />
	</div>
</div>
