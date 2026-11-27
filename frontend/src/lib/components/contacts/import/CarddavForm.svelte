<script lang="ts">
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { ImportRequest } from '$lib/types/contact';

	let { busy, onsubmit }: {
		busy: boolean;
		onsubmit: (request: ImportRequest) => void;
	} = $props();

	const ts = getTranslation();
	const uid = $props.id();

	let request = $state<ImportRequest>({ url: '', username: '', secret: '' });

	function canSubmit(): boolean {
		return !busy && request.url.trim() !== '' && request.username.trim() !== '' && request.secret !== '';
	}

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		if (canSubmit()) onsubmit({ ...request, url: request.url.trim(), username: request.username.trim() });
	}
</script>

<form class="flex flex-col gap-2" onsubmit={submit} novalidate>
	<ModalFormRow label={ts.get.contacts.import_url} labelFor="{uid}-url">
		<TextInput bind:value={request.url} id="{uid}-url" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck={false} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.contacts.import_username} labelFor="{uid}-username">
		<TextInput bind:value={request.username} id="{uid}-username" autocapitalize="off" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.contacts.import_secret} labelFor="{uid}-secret">
		<PasswordInput bind:value={request.secret} showToggle id="{uid}-secret" autocomplete="off" />
	</ModalFormRow>
	<TextButton type="primary" title={ts.get.contacts.import} disabled={!canSubmit()} class="mt-4" />
</form>
