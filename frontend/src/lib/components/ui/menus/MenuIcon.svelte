<script lang="ts">
	import type { MenuIcon } from '$lib/types/menu';
	import IconPlus from '$lib/icons/lucide/plus.svelte';
	import IconFolderPlus from '$lib/icons/lucide/folder-plus.svelte';
	import IconFilePlus from '$lib/icons/lucide/file-plus.svelte';
	import IconTrash from '$lib/icons/lucide/trash.svelte';
	import IconPen from '$lib/icons/lucide/pen.svelte';
	import IconFolderInput from '$lib/icons/lucide/folder-input.svelte';

	let { icon, size }: { icon: MenuIcon; size: number } = $props();
</script>

{#if icon === 'new'}
	<IconPlus {size} class="text-c-btn" />
{:else if icon === 'new-file'}
	<IconFilePlus {size} class="text-c-btn" />
{:else if icon === 'new-folder'}
	<IconFolderPlus {size} class="text-c-btn" />
{:else if icon === 'edit'}
	<IconPen {size} class="text-c-btn" />
{:else if icon === 'move'}
	<IconFolderInput {size} class="text-c-btn" />
{:else if icon === 'delete'}
	<IconTrash {size} class="text-c-danger" />
{/if}
