<script lang="ts">
	import type { MenuIcon } from '$lib/types/menu';
	import IconPlus from '@lucide/svelte/icons/plus';
	import IconFolderPlus from '@lucide/svelte/icons/folder-plus';
	import IconFilePlus from '@lucide/svelte/icons/file-plus';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import IconPen from '@lucide/svelte/icons/pen';

	let { icon, size } = $props<{ icon: MenuIcon; size: number }>();
</script>

{#if icon === 'new'}
	<IconPlus {size} class="text-c-btn" />
{:else if icon === 'new-file'}
	<IconFilePlus {size} class="text-c-btn" />
{:else if icon === 'new-folder'}
	<IconFolderPlus {size} class="text-c-btn" />
{:else if icon === 'edit'}
	<IconPen {size} class="text-c-btn" />
{:else if icon === 'delete'}
	<IconTrash {size} class="text-c-danger" />
{/if}
