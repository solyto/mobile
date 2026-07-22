<script lang="ts">
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let checked = $state<boolean>(false);

	async function test() {
		const permission = await Notification.requestPermission();

		if (permission === 'granted') {
			// Optionally subscribe to push notifications here
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: '<your-public-vapid-key>'
			});
		}
	}
</script>

<div>
	<Toggle label={ts.get.settings.enable_email_notifications} bind:checked onchange={test} />
</div>
