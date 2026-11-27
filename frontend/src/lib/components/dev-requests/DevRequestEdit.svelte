<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import type { DevRequest, DevRequestForm } from '$lib/types/dev_request';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import FileUpload from '$lib/components/forms/FileUpload.svelte';
	import DevRequestFormService from '$lib/services/DevRequestFormService';
	import { isVersion } from '$lib/helpers/VersionHelper';
	import { DEV_REQUEST_STATUSES, devRequestStatusLabels } from '$lib/helpers/DevRequestHelper';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';

	const ts = getTranslation();
	const devRequests = getDevRequests();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const auth = getAuth();

	let { entry, onClose }: {
		entry?: DevRequest;
		onClose: () => void;
	} = $props();

	const formService = new DevRequestFormService();
	let form = $state<DevRequestForm>(entry ? formService.fromEntry(entry) : formService.empty());

	const typeOptions: { value: string; label: string }[] = [
		{ value: 'bug', label: ts.get.dev.requests.bug },
		{ value: 'feature', label: ts.get.dev.requests.feature }
	];

	const priorityOptions: { value: string; label: string }[] = [
		{ value: '1', label: ts.get.dev.requests.priority_1 },
		{ value: '2', label: ts.get.dev.requests.priority_2 },
		{ value: '3', label: ts.get.dev.requests.priority_3 },
		{ value: '4', label: ts.get.dev.requests.priority_4 },
		{ value: '5', label: ts.get.dev.requests.priority_5 }
	];

	const statusLabels = devRequestStatusLabels(ts.get.dev.requests);
	const statusOptions: { value: string; label: string }[] = DEV_REQUEST_STATUSES.map((status) => ({ value: status, label: statusLabels[status] }));

	onMount(async () => {
		loadingIndicator.start();
		try {
			await devRequests.load();
		} finally {
			loadingIndicator.stop();
		}
	});

	function validationError(): string | null {
		if (!formService.isComplete(form)) return ts.get.dev.requests.validation_error;
		const version = formService.versionToCheck(form, entry);
		if (version !== null && !isVersion(version)) return ts.get.dev.requests.version_validation_error;
		return null;
	}

	function save(): Promise<boolean> {
		if (entry) return devRequests.update(entry, formService.changes(entry, form));
		return devRequests.create(formService.createRequest(form, auth.user?.id ?? null));
	}

	async function onSave() {
		const error = validationError();
		if (error) {
			notifications.error(error);
			return;
		}

		loadingIndicator.start();
		let ok: boolean;
		try {
			ok = await save();
		} finally {
			loadingIndicator.stop();
		}

		// Keep the modal and the input open so nothing typed is lost.
		if (!ok) {
			notifications.error(ts.get.dev.requests.save_error);
			return;
		}

		if (!entry) form = formService.empty();
		onClose();
	}
</script>

<ContentModal title={entry ? ts.get.dev.requests.edit : ts.get.dev.requests.new} rounded="2xl" p="8" {onClose}>
	<div class="flex flex-col gap-3">
		<TextInput placeholder={ts.get.dev.requests.title} bind:value={form.title} />
		<TextInput placeholder={ts.get.dev.requests.description} bind:value={form.description} multiLine={true} height={150} />
		<Select bind:value={form.priority} options={priorityOptions} />
		{#if entry}
			<Select bind:value={form.status} options={statusOptions} />
			{#if form.status === 'completed'}
				<TextInput placeholder={ts.get.dev.requests.fixed_in_version} bind:value={form.fixed_in_version} inputmode="decimal" />
			{/if}
		{/if}
		<Select bind:value={form.type} options={typeOptions} />
		{#if !entry}
			<FileUpload label={ts.get.dev.requests.screenshot} bind:value={form.screenshot} bind:filename={form.screenshot_name} />
			<TextInput placeholder={ts.get.dev.requests.url} bind:value={form.url} />
		{/if}
		<div class="mt-4 flex w-full justify-end">
			<TextButton title={ts.get.layout.save} type="btn" onclick={onSave} />
		</div>
	</div>
</ContentModal>
