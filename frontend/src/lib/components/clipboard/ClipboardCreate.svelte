<script lang="ts">
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getClipboard } from '$lib/state/Clipboard.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { CreateClipboardEntryRequest } from '$lib/types/clipboard';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import IconImage from '@lucide/svelte/icons/image';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import {
		REDUCED_IMAGE_QUALITY,
		REDUCED_IMAGE_TYPE,
		canReduceImage,
		getReducedSize,
		shouldReduceImage
	} from '$lib/helpers/ImageHelper';

	const clipboard = getClipboard();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();

	let value = $state<string>('');
	let imagePreview = $state<string | null>(null);
	let imageFile = $state<File | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);
	let canReduce = $state<boolean>(false);
	let reduce = $state<boolean>(false);

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

	async function setImagePreview(file: File): Promise<void> {
		clearImagePreview();
		imageFile = file;
		imagePreview = URL.createObjectURL(file);
		if (!canReduceImage(file.type)) return;
		try {
			const bitmap = await createImageBitmap(file);
			reduce = shouldReduceImage(file.type, file.size, bitmap.width, bitmap.height);
			canReduce = true;
			bitmap.close();
		} catch {
			canReduce = false;
		}
	}

	async function getReducedFile(file: File): Promise<File> {
		const bitmap = await createImageBitmap(file);
		const { width, height } = getReducedSize(bitmap.width, bitmap.height);
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
		bitmap.close();
		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, REDUCED_IMAGE_TYPE, REDUCED_IMAGE_QUALITY)
		);
		if (!blob || blob.size >= file.size) return file;
		return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: REDUCED_IMAGE_TYPE });
	}

	async function onSaveImage(): Promise<void> {
		const original = imageFile;
		if (!original) return;
		loadingIndicator.start();
		const file = reduce ? await getReducedFile(original).catch(() => original) : original;
		const res = await clipboard.createImage(file);
		if (res === 'ok') {
			notifications.success(ts.get.clipboard.image_save_success);
			clearImagePreview();
		} else if (res === 'too_large') {
			notifications.error(ts.get.clipboard.image_too_large);
		} else {
			notifications.error(ts.get.clipboard.image_save_error);
		}
		loadingIndicator.stop();
	}

	function clearImagePreview(): void {
		if (imagePreview) URL.revokeObjectURL(imagePreview);
		imagePreview = null;
		imageFile = null;
		canReduce = false;
		reduce = false;
		if (fileInput) fileInput.value = '';
	}
</script>

<div class="flex w-full flex-col md:w-1/2">
	<Heading title={ts.get.clipboard.add_entry} my={0} mb={8} />

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
		<div class="flex w-full items-center justify-end gap-4">
			{#if canReduce}
				<div class="mr-auto">
					<Toggle label={ts.get.clipboard.image_reduce} bind:checked={reduce} onchange={() => {}} />
				</div>
			{/if}
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
