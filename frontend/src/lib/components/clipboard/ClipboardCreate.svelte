<script lang="ts">
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { Clipboard, getClipboard } from '$lib/state/Clipboard.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { CreateClipboardEntryRequest } from '$lib/types/clipboard';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import IconImage from '$lib/icons/lucide/image.svelte';
	import IconPaperclip from '$lib/icons/lucide/paperclip.svelte';
	import { RateLimitedError } from '$lib/services/ApiService';
	import { clipboardFileLimitMessage } from '$lib/helpers/NetworkErrorHelper';
	import ClipboardFileInfo from '$lib/components/clipboard/ClipboardFileInfo.svelte';
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
	const saving = new SaveAction(() => ts.get.clipboard.save_error);

	let value = $state<string>('');
	let imagePreview = $state<string | null>(null);
	let imageFile = $state<File | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);
	let canReduce = $state<boolean>(false);
	let reduce = $state<boolean>(false);
	let selectedFile = $state<File | null>(null);
	let documentInput = $state<HTMLInputElement | null>(null);

	const PICKER_BUTTON = 'flex cursor-pointer items-center gap-2 rounded-md bg-c-btn px-4 py-2 text-white transition-opacity hover:opacity-90';
	const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
	const IMAGE_ACCEPT = IMAGE_TYPES.join(',');
	// The paperclip takes images too, so it is never the wrong button; the image button stays for the phone's gallery picker.
	const DOCUMENT_ACCEPT = [...Clipboard.FILE_EXTENSIONS.map((extension) => '.' + extension), ...IMAGE_TYPES].join(',');

	async function onSave(): Promise<void> {
		const request: CreateClipboardEntryRequest = { content: value };
		const saved = await saving.run(() => clipboard.create(request));
		if (!saved) return;
		notifications.success(ts.get.clipboard.save_success);
		value = '';
	}

	function pickImage(): void {
		fileInput?.click();
	}

	function pickDocument(): void {
		documentInput?.click();
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

	function onDocumentSelect(e: Event): void {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];
		if (IMAGE_TYPES.includes(file.type)) {
			// Reset now: the image flow only clears the image input, and the same file picked again must fire change.
			input.value = '';
			setImagePreview(file);
			return;
		}
		selectedFile = file;
	}

	async function onSaveFile(): Promise<void> {
		if (!selectedFile) return;
		loadingIndicator.start();
		try {
			const res = await clipboard.createFile(selectedFile);
			if (res === 'ok') {
				notifications.success(ts.get.clipboard.file_save_success);
				clearSelectedFile();
			} else if (res === 'too_large') {
				notifications.error(ts.get.clipboard.file_too_large);
			} else if (res === 'invalid_type') {
				notifications.error(ts.get.clipboard.file_invalid_type);
			} else {
				notifications.error(ts.get.clipboard.file_save_error);
			}
		} catch (e) {
			if (!(e instanceof RateLimitedError)) throw e;
			notifications.error(clipboardFileLimitMessage(e.retryAfter, ts.get.clipboard));
		} finally {
			loadingIndicator.stop();
		}
	}

	function clearSelectedFile(): void {
		selectedFile = null;
		if (documentInput) documentInput.value = '';
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
		accept={IMAGE_ACCEPT}
	/>
	<input type="file" bind:this={documentInput} onchange={onDocumentSelect} class="hidden" accept={DOCUMENT_ACCEPT} />

	{#if imagePreview}
		<div class="relative mb-4">
			<img
				src={imagePreview}
				alt={ts.get.clipboard.image_preview_alt}
				class="max-h-64 rounded-md border border-c-neutral-2 dark:border-s-dark"
			/>
			<div class="absolute top-[-10px] right-[-10px]">
				<CloseButton onClick={clearImagePreview} inModal={false} />
			</div>
		</div>
		<div class="flex w-full items-center justify-end gap-4">
			{#if canReduce}
				<div class="mr-auto">
					<Toggle label={ts.get.clipboard.image_reduce} bind:checked={reduce} />
				</div>
			{/if}
			<TextButton title={ts.get.clipboard.save} onclick={onSaveImage} />
		</div>
	{:else if selectedFile}
		<div class="relative mb-4 rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2">
			<ClipboardFileInfo name={selectedFile.name} size={selectedFile.size} />
			<div class="absolute top-[-10px] right-[-10px]">
				<CloseButton onClick={clearSelectedFile} inModal={false} />
			</div>
		</div>
		<div class="flex w-full justify-end">
			<TextButton title={ts.get.clipboard.save} onclick={onSaveFile} />
		</div>
	{:else}
		<div onpaste={onPasteEvent}>
			<TextInput multiLine={true} bind:value height={200} />
		</div>
		<div class="mt-4 flex w-full justify-end gap-4">
			<button class={PICKER_BUTTON} onclick={pickImage} title={ts.get.clipboard.attach_image} aria-label={ts.get.clipboard.attach_image}>
				<IconImage class="size-4" />
			</button>
			<button class={PICKER_BUTTON} onclick={pickDocument} title={ts.get.clipboard.attach_file} aria-label={ts.get.clipboard.attach_file}>
				<IconPaperclip class="size-4" />
			</button>
			<TextButton title={ts.get.clipboard.save} onclick={onSave} />
		</div>
	{/if}
</div>
