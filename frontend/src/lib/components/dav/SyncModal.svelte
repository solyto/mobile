<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';

	const ts = getTranslation();
	const auth = getAuth();

	let { onClose } = $props<{
		onClose: () => void;
	}>();
</script>

<ContentModal title={ts.get.dav.synchronize} rounded="2xl" {onClose}>
	<p>
		{ts.get.dav.synchronize_headline}
		<br /><br />
		<b>{ts.get.dav.synchronize_server}</b>: https://dav.solyto.de<br />
		<b>{ts.get.dav.synchronize_username}</b>: {auth.user?.email}<br />
		<b>{ts.get.dav.synchronize_password}</b>: {ts.get.dav.synchronize_password_value}
	</p>
</ContentModal>
