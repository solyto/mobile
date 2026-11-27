<script lang="ts">
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();
	const notes = getNotes();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFile = $state<File | null>(null);
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let uploadError = $state<string | null>(null);
	let uploadSuccess = $state(false);

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			selectedFile = input.files[0];
			uploadError = null;
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!selectedFile) {
			uploadError = ts.get.notes.import_no_file;
			return;
		}

		loadingIndicator.start();

		try {
			isUploading = true;
			uploadProgress = 0;
			uploadSuccess = false;

			const ok = await notes.importFile(selectedFile);

			if (ok) {
				uploadSuccess = true;
				selectedFile = null;
				if (fileInput) fileInput.value = '';
				notifications.success(ts.get.notes.import_success);
			}
		} catch (error) {
			uploadError = error instanceof Error ? error.message : ts.get.notes.import_unknown_error;
		} finally {
			isUploading = false;
			loadingIndicator.stop();
		}
	}

	function progressLabel(): string {
		return ts.get.notes.import_progress.replace('%d', String(uploadProgress));
	}

	function fileSizeLabel(file: File): string {
		return ts.get.notes.import_file_size.replace('%s', (file.size / 1024).toFixed(2));
	}
</script>

<form onsubmit={handleSubmit} class="mx-auto w-160 p-6">
	<h2 class="mb-4 text-xl font-semibold">{ts.get.notes.import_title}</h2>

	<div class="mb-4">
		<label for="file-upload" class="mb-2 block text-sm font-medium text-c-neutral-7">
			{ts.get.notes.import_select_file}
		</label>
		<input
			id="file-upload"
			type="file"
			bind:this={fileInput}
			onchange={handleFileChange}
			class="block w-full text-sm text-c-neutral-5
             file:mr-4 file:rounded-md file:border-0
             file:bg-blue-50 file:px-4
             file:py-2 file:text-sm
             file:font-semibold file:text-blue-700
             hover:file:bg-blue-100"
		/>
	</div>

	{#if selectedFile}
		<div class="mb-4 rounded bg-c-neutral p-3">
			<p class="text-sm">
				<span class="font-medium">{ts.get.notes.import_selected_file}</span>
				{selectedFile.name}
			</p>
			<p class="text-xs text-c-neutral-5">{fileSizeLabel(selectedFile)}</p>
		</div>
	{/if}

	{#if isUploading}
		<div class="mb-4">
			<div class="h-2.5 w-full rounded-full bg-c-neutral-2">
				<div class="h-2.5 rounded-full bg-blue-600" style="width: {uploadProgress}%"></div>
			</div>
			<p class="mt-1 text-center text-xs">{progressLabel()}</p>
		</div>
	{/if}

	{#if uploadError}
		<div class="mb-4 rounded bg-red-50 p-3 text-red-700">
			{uploadError}
		</div>
	{/if}

	{#if uploadSuccess}
		<div class="mb-4 rounded bg-green-50 p-3 text-green-700">{ts.get.notes.import_uploaded}</div>
	{/if}

	<button
		type="submit"
		disabled={isUploading || !selectedFile}
		class="w-full cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
	>
		{isUploading ? ts.get.notes.import_uploading : ts.get.notes.import_upload}
	</button>
</form>
