<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte'
	import TextInput from '$lib/components/forms/TextInput.svelte'
	import FileUpload from '$lib/components/forms/FileUpload.svelte'
	import { getTranslation } from '$lib/state/Translation.svelte'
	import { fly } from 'svelte/transition';

	let { onConfirm, onCancel }: { onConfirm: (src: string) => void; onCancel: () => void } =
		$props()

	const ts = getTranslation()

	type Mode = 'url' | 'clipboard' | 'upload'
	let mode = $state<Mode>('url')
	let urlValue = $state('')
	let uploadedBase64 = $state('')
	let clipboardPreview = $state<string | null>(null)
	let clipboardError = $state(false)

	async function pasteFromClipboard() {
		clipboardError = false
		clipboardPreview = null
		try {
			const items = await navigator.clipboard.read()
			for (const item of items) {
				for (const type of item.types) {
					if (type.startsWith('image/')) {
						const blob = await item.getType(type)
						const reader = new FileReader()
						reader.onload = (e) => {
							clipboardPreview = e.target?.result as string
						}
						reader.readAsDataURL(blob)
						return
					}
				}
			}
			clipboardError = true
		} catch {
			clipboardError = true
		}
	}

	function confirm() {
		if (mode === 'url' && urlValue.trim()) {
			onConfirm(urlValue.trim())
		} else if (mode === 'clipboard' && clipboardPreview) {
			onConfirm(clipboardPreview)
		} else if (mode === 'upload' && uploadedBase64) {
			onConfirm(uploadedBase64)
		}
	}

	function switchMode(next: Mode) {
		mode = next
		clipboardError = false
		clipboardPreview = null
	}
</script>

<Modal title={ts.get.notes.insert_image} onConfirm={confirm} onCancel={onCancel} width="w-112">
	<!-- Tabs -->
	<div class="mb-4 flex gap-1 rounded-lg bg-c-neutral-1 p-1 dark:bg-s-dark-3">
		{#each (['url', 'clipboard', 'upload'] as Mode[]) as tab}
			<button
				onclick={() => switchMode(tab)}
				class="flex-1 rounded-md py-1.5 text-sm font-medium transition-all cursor-pointer"
				class:bg-white={mode === tab}
				class:text-c-text={mode === tab}
				class:shadow-xs={mode === tab}
				class:dark:bg-s-dark-2={mode === tab}
				class:dark:text-white={mode === tab}
				class:text-c-neutral-5={mode !== tab}
			>
				{#if tab === 'url'}{ts.get.notes.insert_image_url}
				{:else if tab === 'clipboard'}{ts.get.notes.insert_image_clipboard}
				{:else}{ts.get.notes.insert_image_upload}
				{/if}
			</button>
		{/each}
	</div>

	<div class="h-24">
		{#if mode === 'url'}
			<div in:fly={{ x: 20 }}>
				<TextInput bind:value={urlValue} placeholder="https://" onblur={() => {}} />
			</div>
		{:else if mode === 'clipboard'}
			<div class="flex flex-col items-center gap-3 py-2" in:fly={{ x: 20 }}>
				{#if clipboardPreview}
					<img src={clipboardPreview} alt="Clipboard preview" class="max-h-48 rounded-lg object-contain" />
				{:else}
					<button
						onclick={pasteFromClipboard}
						class="w-full rounded-lg border-2 border-dashed border-c-neutral-3 py-8 text-sm text-c-neutral-5 transition-colors hover:border-s-teal hover:text-s-teal dark:border-s-dark dark:hover:border-s-teal"
					>
						{ts.get.notes.insert_image_clipboard}
					</button>
					{#if clipboardError}
						<p class="text-sm text-s-delete">{ts.get.notes.insert_image_no_clipboard}</p>
					{/if}
				{/if}
			</div>
		{:else}
			<div in:fly={{ x: 20 }}>
				{#if uploadedBase64}
					<img src={uploadedBase64} alt="Upload preview" class="max-h-48 w-full rounded-lg object-contain" />
				{:else}
					<FileUpload bind:value={uploadedBase64} />
				{/if}
			</div>
		{/if}
	</div>
</Modal>
