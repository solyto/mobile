<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte'
	import TextInput from '$lib/components/forms/TextInput.svelte'
	import { getTranslation } from '$lib/state/Translation.svelte'

	let {
		onConfirm,
		onCancel,
		initialName = ''
	}: { onConfirm: (url: string, name: string) => void; onCancel: () => void; initialName?: string } =
		$props()

	const ts = getTranslation()

	let urlValue = $state('')
	let nameValue = $state(initialName)

	function confirm() {
		if (urlValue.trim()) {
			onConfirm(urlValue.trim(), nameValue.trim())
		}
	}
</script>

<Modal title={ts.get.notes.insert_link} onConfirm={confirm} onCancel={onCancel} width="w-112">
	<div class="flex flex-col gap-3">
		<div>
			<span class="mb-1 block text-sm text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.notes.insert_link_url}
			</span>
			<TextInput bind:value={urlValue} placeholder="https://" onblur={() => {}} />
		</div>
		<div>
			<span class="mb-1 block text-sm text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.notes.insert_link_name}
			</span>
			<TextInput bind:value={nameValue} placeholder={ts.get.notes.insert_link_name} onblur={() => {}} />
		</div>
	</div>
</Modal>
