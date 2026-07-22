<script lang="ts">
	import { getClipboard } from '$lib/state/Clipboard.svelte';
	import IconClipboardCopy from '@lucide/svelte/icons/clipboard-copy';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import { formatDate } from '$lib/helpers/DateHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { API_USER_STORAGE_URL, apiRoutes } from '$lib/config/apiRoutes';
	import type { ClipboardEntry } from '$lib/types/clipboard';

	const clipboard = getClipboard();
	const ts = getTranslation();
	const notifications = getUiNotifications();
	const loadingIndicator = getLoadingIndicator();

	async function onCopyText(content: string): Promise<void> {
		await navigator.clipboard.writeText(content);
		notifications.success(ts.get.clipboard.copy_success);
	}

	function getImageApiUrl(id: number): string {
		return apiRoutes.clipboard.getImage.replace('%d', id.toString());
	}

	async function onCopyImage(entry: ClipboardEntry): Promise<void> {
		try {
			const pngPromise = clipboard.apiService.image(getImageApiUrl(entry.id)).then((blob) => {
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
					result ? resolve(result) : reject();
				}, 'image/png');
			};
			img.onerror = () => {
				URL.revokeObjectURL(img.src);
				reject();
			};
			img.src = URL.createObjectURL(blob);
		});
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
		<button
			class="flex size-8 cursor-pointer items-center justify-center rounded-full bg-c-action text-white drop-shadow-md transition-all hover:drop-shadow-xl"
			onclick={() =>
				entry.type === 'image' ? onCopyImage(entry) : onCopyText(entry.content)}
		>
			<IconClipboardCopy class="size-4" />
		</button>
		<button
			class="flex size-8 cursor-pointer items-center justify-center rounded-full bg-c-danger text-white drop-shadow-md transition-all hover:drop-shadow-xl"
			onclick={() => onDelete(entry)}
		>
			<IconTrash class="size-4" />
		</button>
	</div>
{/snippet}

<div class="flex w-full flex-col gap-4 md:w-1/2">
	<h1 class="mb-4 text-xl font-bold text-c-heading dark:text-c-primary">
		{ts.get.clipboard.history}
	</h1>
	{#each clipboard.entries as entry (entry.id)}
		{#if entry.type === 'image' && entry.file_path}
			<div
				class="relative inline-block self-start overflow-hidden rounded-md shadow-sm dark:shadow-s-dark-shadow"
			>
				<img
					src={API_USER_STORAGE_URL + '/' + entry.file_path}
					alt="Clipboard"
					class="block max-h-64 rounded-md"
				/>
				<div class="absolute top-2 right-2">
					{@render actionButtons(entry)}
				</div>
				<div
					class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-1.5 text-xs text-white/80"
				>
					{formatDate(entry.created_at)}
				</div>
			</div>
		{:else}
			<div
				class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
			>
				<div class="absolute top-[-10px] right-[-10px]">
					{@render actionButtons(entry)}
				</div>
				<p class="pr-16 text-sm">{entry.content}</p>
				<div class="mt-2 text-xs text-c-neutral-4">
					{formatDate(entry.created_at)}
				</div>
			</div>
		{/if}
	{/each}
</div>
