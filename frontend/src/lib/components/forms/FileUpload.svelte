<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';

	/* eslint-disable no-useless-assignment -- the $bindable fallbacks are read by the parent through bind: */
	let {
		label,
		value = $bindable(''),
		input = $bindable<HTMLInputElement | null>(null),
		filename = $bindable(''),
		accept,
		onfile
	}: {
		label?: string;
		value?: string;
		input?: HTMLInputElement | null;
		filename?: string;
		accept?: string;
		onfile?: (file: File) => Promise<boolean>;
	} = $props();
	/* eslint-enable no-useless-assignment */

	const ts = getTranslation();
	const uid = $props.id();

	let selectedFile = $state<File | null>(null);
	let isUploading = $state(false);
	let isHandingOver = $state(false);
	let uploadProgress = $state(0);
	let uploadError = $state<string | null>(null);

	async function handleFileChange(event: Event) {
		const inputElement = event.target as HTMLInputElement;
		if (inputElement.files && inputElement.files.length > 0) {
			selectedFile = inputElement.files[0];
			uploadError = null;

			if (onfile) {
				await handOver(inputElement, selectedFile, onfile);
				return;
			}

			try {
				isUploading = true;
				uploadProgress = 0;

				const base64String = await fileToBase64(selectedFile);
				value = base64String;
				filename = selectedFile.name;

				uploadProgress = 100;
			} catch (error) {
				uploadError = error instanceof Error ? error.message : 'Failed to process file';
			} finally {
				isUploading = false;
			}
		}
	}

	async function handOver(inputElement: HTMLInputElement, file: File, deliver: (file: File) => Promise<boolean>): Promise<void> {
		isHandingOver = true;
		try {
			if (await deliver(file)) return;
			selectedFile = null;
			inputElement.value = '';
		} finally {
			isHandingOver = false;
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

<div class="flex w-full flex-col gap-2">
	{#if label}
		<span class="text-sm font-bold">{label}</span>
	{/if}

	<div class="flex min-w-0 items-center gap-3">
		<input
			id="{uid}-file"
			type="file"
			class="peer sr-only"
			aria-label={ts.get.layout.select_file}
			{accept}
			disabled={isHandingOver}
			bind:this={input}
			onchange={handleFileChange}
		/>
		<label
			for="{uid}-file"
			class="flex h-10 shrink-0 items-center rounded-lg border-1 border-c-neutral-2 bg-c-bg-elevated px-4 text-sm font-medium shadow-xs transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-d-lightblue dark:border-s-dark-3 dark:text-white dark:peer-focus-visible:ring-c-primary"
			class:cursor-pointer={!isHandingOver}
			class:hover:shadow-sm={!isHandingOver}
			class:opacity-40={isHandingOver}
		>
			{ts.get.layout.select_file}
		</label>
		<span class="min-w-0 truncate text-sm text-c-neutral-5 dark:text-c-neutral-4">
			{selectedFile ? selectedFile.name : ts.get.layout.no_file}
		</span>
	</div>

	{#if uploadError}
		<p class="text-sm text-c-danger" role="alert">{uploadError}</p>
	{/if}

	{#if isUploading}
		<div>
			<div class="h-2.5 w-full rounded-full bg-c-neutral-2 dark:bg-s-dark-3">
				<div class="h-2.5 rounded-full bg-c-primary" style="width: {uploadProgress}%"></div>
			</div>
			<p class="mt-1 text-center text-xs">{ts.get.layout.processing}: {uploadProgress}%</p>
		</div>
	{/if}
</div>
