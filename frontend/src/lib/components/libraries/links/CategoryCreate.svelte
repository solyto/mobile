<script lang="ts">
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getLinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ColorPicker from 'svelte-awesome-color-picker';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';

	const keyManager = getKeyManager();
	const loadingIndicator = getLoadingIndicator();
	const library = getLinkLibrary();
	const ts = getTranslation();

	let addCategory = $state<boolean>(false);
	let input = $state<HTMLInputElement | null>(null);
	let title = $state<string>('');
	let hex = $state<string>('#1dbda5');

	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	async function toggleAddCategory() {
		addCategory = !addCategory;

		if (addCategory) {
			await tick();
			input?.focus();

			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onsubmit();
		await toggleAddCategory();
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	function onblur(): void {
		addCategory = false;
		keyManager.unregisterAll(keyHandlers);
	}

	async function onsubmit(): Promise<void> {
		loadingIndicator.start();
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		let categoryTitle = title.trim();

		if (categoryTitle === '') {
			return;
		}

		await library.createCategory(title, hex);
		loadingIndicator.stop();
		title = '';
		hex = '#1dbda5';
		addCategory = false;
	}
</script>

<div class="ml-4">
	<AddButton onClick={toggleAddCategory} colorOnHover={true} />
</div>

{#if addCategory}
	<ContentModal title={ts.get.libraries.links.create_category} onClose={toggleAddCategory}>
		<div class="flex w-full items-center gap-4">
			<div class="fixed" use:clickOutside={() => {}}>
				<ColorPicker
					bind:hex
					position="responsive"
					nullable={false}
					label=""
					isTextInput={false}
					--cp-border-color="var(--color-c-neutral-2)"
				/>
			</div>
			<div class="w-10"></div>
			<TextInput
				bind:value={title}
				bind:input
				placeholder={ts.get.libraries.links.category_title}
			/>
		</div>
		<div class="mt-8 flex w-full flex-row items-center justify-end">
			<TextButton title={ts.get.layout.save} onclick={onsubmit} />
		</div>
	</ContentModal>
{/if}
