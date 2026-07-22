<script lang="ts">
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getClipboard } from '$lib/state/Clipboard.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { CreateClipboardEntryRequest } from '$lib/types/clipboard';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import IconImage from '@lucide/svelte/icons/image';

	const clipboard = getClipboard();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();

	let value = $state<string>('');
	let imagePreview = $state<string | null>(null);
	let imageFile = $state<File | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);

	async function onSave(): Promise<void> {
		loadingIndicator.start();
		const request: CreateClipboardEntryRequest = { content: value };
		const res = await clipboard.create(request);
		if (res) {
			notifications.success(ts.get.clipboard.save_success);
			value = '';
		} else {
			notifications.error(ts.get.clipboard.save_error);
		}
		loadingIndicator.stop();
	}

	function onPasteEvent(e: ClipboardEvent): void {
		const items = e.clipboardData?.items;
		if (!items) return;

		for (const item of items) {
			if (item.type.startsWith('image/')) {
				e.preventDefault();
				const file = item.getAsFile();
				if (!file) return;
				setImagePreview(file);
				return;
			}
		}
	}

	function onFileSelect(e: Event): void {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			setImagePreview(input.files[0]);
		}
	}

	function setImagePreview(file: File): void {
		clearImagePreview();
		imageFile = file;
		imagePreview = URL.createObjectURL(file);
	}

	async function onSaveImage(): Promise<void> {
		if (!imageFile) return;
		loadingIndicator.start();
		const res = await clipboard.createImage(imageFile);
		if (res) {
			notifications.success(ts.get.clipboard.image_save_success);
			clearImagePreview();
		} else {
			notifications.error(ts.get.clipboard.image_save_error);
		}
		loadingIndicator.stop();
	}

	function clearImagePreview(): void {
		if (imagePreview) URL.revokeObjectURL(imagePreview);
		imagePreview = null;
		imageFile = null;
		if (fileInput) fileInput.value = '';
	}
</script>

<div class="flex w-full flex-col md:w-1/2">
	<h1 class="mb-8 text-xl font-bold text-c-heading dark:text-c-primary">
		{ts.get.clipboard.add_entry}
	</h1>

	<input
		type="file"
		bind:this={fileInput}
		onchange={onFileSelect}
		class="hidden"
		accept="image/jpeg,image/png,image/gif,image/webp"
	/>

	{#if imagePreview}
		<div class="relative mb-4">
			<img
				src={imagePreview}
				alt="Preview"
				class="max-h-64 rounded-md border border-c-neutral-2 dark:border-s-dark"
			/>
			<div class="absolute top-[-10px] right-[-10px]">
				<CloseButton onClick={clearImagePreview} inModal={false} />
			</div>
		</div>
		<div class="flex w-full justify-end gap-4">
			<TextButton title={ts.get.clipboard.save} onclick={onSaveImage} />
		</div>
	{:else}
		<div onpaste={onPasteEvent}>
			<TextInput multiLine={true} bind:value height={200} />
		</div>
		<div class="mt-4 flex w-full justify-end gap-4">
			<button
				class="flex cursor-pointer items-center gap-2 rounded-md bg-c-btn px-4 py-2 text-white transition-opacity hover:opacity-90"
				onclick={() => fileInput?.click()}
			>
				<IconImage class="size-4" />
			</button>
			<TextButton title={ts.get.clipboard.save} onclick={onSave} />
		</div>
	{/if}
</div>
