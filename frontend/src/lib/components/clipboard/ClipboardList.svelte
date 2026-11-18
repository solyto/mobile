<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getClipboard } from '$lib/state/Clipboard.svelte';
	import IconClipboardCopy from '@lucide/svelte/icons/clipboard-copy';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import IconDownload from '@lucide/svelte/icons/download';
	import { formatDate } from '$lib/helpers/DateHelper';
	import { getFileExtension, truncate } from '$lib/helpers/FormatHelper';
	import { downloadBlob } from '$lib/helpers/DownloadHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ClipboardImage from '$lib/components/clipboard/ClipboardImage.svelte';
	import ClipboardFileInfo from '$lib/components/clipboard/ClipboardFileInfo.svelte';
	import type { ClipboardEntry } from '$lib/types/clipboard';

	const clipboard = getClipboard();
	const ts = getTranslation();
	const notifications = getUiNotifications();
	const loadingIndicator = getLoadingIndicator();

	const MAX_TEXT_PREVIEW_LENGTH = 200;
	const ACTION_BUTTON = 'flex size-8 cursor-pointer items-center justify-center rounded-full bg-c-action text-c-action-icon drop-shadow-md transition-all hover:drop-shadow-xl';

	async function onCopyText(content: string): Promise<void> {
		await navigator.clipboard.writeText(content);
		notifications.success(ts.get.clipboard.copy_success);
	}

	async function onCopyImage(entry: ClipboardEntry): Promise<void> {
		try {
			const pngPromise = clipboard.getImage(entry).then((blob) => {
				if (!blob) throw new Error();
				return convertToPng(blob);
			});
			const item = new ClipboardItem({ 'image/png': pngPromise });
			await navigator.clipboard.write([item]);
			notifications.success(ts.get.clipboard.image_copy_success);
		} catch {
			notifications.error(ts.get.clipboard.image_copy_error);
		}
	}

	function convertToPng(blob: Blob): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				canvas.getContext('2d')!.drawImage(img, 0, 0);
				canvas.toBlob((result) => {
					URL.revokeObjectURL(img.src);
					if (result) resolve(result);
				else reject();
				}, 'image/png');
			};
			img.onerror = () => {
				URL.revokeObjectURL(img.src);
				reject();
			};
			img.src = URL.createObjectURL(blob);
		});
	}

	async function onCopy(entry: ClipboardEntry): Promise<void> {
		if (entry.type === 'image') await onCopyImage(entry);
		else await onCopyText(entry.content);
	}

	async function onDownload(entry: ClipboardEntry): Promise<void> {
		let blob: Blob | null;
		loadingIndicator.start();
		try {
			blob = entry.type === 'image' ? await clipboard.getImage(entry) : await clipboard.getFile(entry);
		} finally {
			loadingIndicator.stop();
		}
		if (!blob) {
			notifications.error(ts.get.clipboard.file_download_error);
			return;
		}
		downloadBlob(blob, entry.type === 'image' ? imageFileName(entry, blob) : (entry.file_name ?? 'file'));
	}

	// Images have no original name; the stored path keeps the original format's extension.
	function imageFileName(entry: ClipboardEntry, blob: Blob): string {
		const extension = getFileExtension(entry.file_path ?? '') || blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
		return `clipboard-${entry.id}.${extension}`;
	}

	async function onDelete(entry: ClipboardEntry): Promise<void> {
		loadingIndicator.start();
		const res = await clipboard.delete(entry);
		if (!res) notifications.error(ts.get.clipboard.delete_error);
		loadingIndicator.stop();
	}
</script>

{#snippet actionButtons(entry: ClipboardEntry)}
	<div class="flex gap-2">
		{#if entry.type !== 'file'}
			<button class={ACTION_BUTTON} onclick={() => onCopy(entry)}>
				<IconClipboardCopy class="size-4" />
			</button>
		{/if}
		{#if entry.type !== 'text'}
			<button class={ACTION_BUTTON} onclick={() => onDownload(entry)}>
				<IconDownload class="size-4" />
			</button>
		{/if}
		<button
			class="flex size-8 cursor-pointer items-center justify-center rounded-full bg-c-danger text-white drop-shadow-md transition-all hover:drop-shadow-xl"
			onclick={() => onDelete(entry)}
		>
			<IconTrash class="size-4" />
		</button>
	</div>
{/snippet}

{#snippet card(entry: ClipboardEntry, body: Snippet<[ClipboardEntry]>)}
	<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2">
		<div class="absolute top-[-10px] right-[-10px]">
			{@render actionButtons(entry)}
		</div>
		{@render body(entry)}
		<div class="mt-2 text-xs text-c-neutral-4">
			{formatDate(entry.created_at)}
		</div>
	</div>
{/snippet}

{#snippet textBody(entry: ClipboardEntry)}
	<p class="pr-16 text-sm break-words whitespace-pre-wrap">
		{truncate(entry.content, MAX_TEXT_PREVIEW_LENGTH)}
	</p>
{/snippet}

{#snippet fileBody(entry: ClipboardEntry)}
	<ClipboardFileInfo name={entry.file_name ?? ''} size={entry.file_size ?? 0} />
{/snippet}

<div class="flex w-full flex-col gap-6 md:w-1/2">
	<Heading title={ts.get.clipboard.history} my={0} mb={4} />
	{#each clipboard.entries as entry (entry.id)}
		{#if entry.type === 'image'}
			<!-- Clipped inside, so the buttons can overhang the corner as on text and file entries. -->
			<div class="relative inline-block self-start rounded-md shadow-sm dark:shadow-s-dark-shadow">
				<div class="relative overflow-hidden rounded-md">
					<ClipboardImage {entry} />
					<div
						class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-1.5 text-xs text-white/80"
					>
						{formatDate(entry.created_at)}
					</div>
				</div>
				<div class="absolute top-[-10px] right-[-10px]">
					{@render actionButtons(entry)}
				</div>
			</div>
		{:else if entry.type === 'file'}
			{@render card(entry, fileBody)}
		{:else}
			{@render card(entry, textBody)}
		{/if}
	{/each}
</div>
