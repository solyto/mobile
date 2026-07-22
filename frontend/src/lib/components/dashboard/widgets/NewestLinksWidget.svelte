<script lang="ts">
	import type { Link } from '$lib/types/library_link';
	import { blur } from 'svelte/transition';
	import IconLink from '@lucide/svelte/icons/link';
	import IconExternalLink from '@lucide/svelte/icons/external-link';
	import type { Translation } from '$lib/state/Translation.svelte';

	let { newestLinks, ts } = $props<{
		newestLinks: Link[];
		ts: Translation;
	}>();
</script>

<div in:blur>
	<div class="mb-2 flex items-center gap-2">
		<IconLink size={15} class="text-c-heading dark:text-c-primary" />
		<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
			{ts.get.home.newest_links}
		</span>
	</div>
	<div class="flex flex-col gap-1">
		{#each newestLinks as link (link.id)}
			<a
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				class="group flex items-center gap-2 py-0.5 transition-colors"
			>
				<span class="truncate text-sm text-c-neutral-7 transition-colors group-hover:text-c-primary dark:text-c-neutral-3">
					{link.title}
				</span>
				<IconExternalLink
					size={12}
					class="ml-auto shrink-0 text-c-neutral-4 opacity-0 transition-opacity group-hover:opacity-100"
				/>
			</a>
		{/each}
	</div>
</div>