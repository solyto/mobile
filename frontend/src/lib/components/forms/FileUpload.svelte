<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';

	let {
		label,
		value = $bindable(''),
		input = $bindable<HTMLInputElement | null>(null),
		filename = $bindable('')
	} = $props<{
		label?: string;
		value?: string;
		input?: HTMLInputElement | null;
		filename?: string;
	}>();

	const ts = getTranslation();

	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFile = $state<File | null>(null);
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let uploadError = $state<string | null>(null);
	let uploadSuccess = $state(false);

	$effect(() => {
		input = fileInput;
	});

	async function handleFileChange(event: Event) {
		const inputElement = event.target as HTMLInputElement;
		if (inputElement.files && inputElement.files.length > 0) {
			selectedFile = inputElement.files[0];
			uploadError = null;
			uploadSuccess = false;

			try {
				isUploading = true;
				uploadProgress = 0;

				const base64String = await fileToBase64(selectedFile);
				value = base64String;
				filename = selectedFile.name;

				uploadSuccess = true;
				uploadProgress = 100;
			} catch (error) {
				uploadError = error instanceof Error ? error.message : 'Failed to process file';
			} finally {
				isUploading = false;
			}
		}
	}

	async function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = () => {
				if (reader.result && typeof reader.result === 'string') {
					resolve(reader.result);
				} else {
					reject(new Error('Failed to read file'));
				}
			};

			reader.onerror = () => {
				reject(new Error('Error reading file'));
			};

			reader.onprogress = (event) => {
				if (event.lengthComputable) {
					uploadProgress = Math.round((event.loaded / event.total) * 100);
				}
			};

			reader.readAsDataURL(file);
		});
	}
</script>

<div class="my-2 w-full p-1">
	{#if label}
		<h2 class="mb-4 text-xl font-semibold">{label}</h2>
	{/if}

	<div>
		<label
			for="file-upload"
			class="mb-2 block text-sm font-medium text-c-neutral-7 dark:text-c-neutral-5"
		>
			{ts.get.layout.select_file}
		</label>
		<input
			id="file-upload"
			type="file"
			bind:this={fileInput}
			onchange={handleFileChange}
			class="block w-full text-sm text-c-neutral-5
             file:mr-4 file:rounded-md file:border-0
             file:bg-blue-50 file:px-4
             file:py-2 file:text-sm file:font-semibold
             file:text-blue-700 file:transition-all
             hover:file:bg-blue-100"
		/>
	</div>

	{#if selectedFile}
		<div
			class="mt-4 rounded bg-c-neutral p-3"
			class:bg-red-200={uploadError}
			class:bg-green-200={uploadSuccess}
		>
			<p class="text-sm">
				<span class="font-medium">{ts.get.layout.selected_file}:</span>
				{selectedFile.name}
			</p>
			<p class="text-xs text-c-neutral-5">{(selectedFile.size / 1024).toFixed(2)} KB</p>
		</div>
	{/if}

	{#if isUploading}
		<div class="mb-4">
			<div class="h-2.5 w-full rounded-full bg-c-neutral-2">
				<div class="h-2.5 rounded-full bg-blue-600" style="width: {uploadProgress}%"></div>
			</div>
			<p class="mt-1 text-center text-xs">{ts.get.layout.processing}: {uploadProgress}%</p>
		</div>
	{/if}
</div>
