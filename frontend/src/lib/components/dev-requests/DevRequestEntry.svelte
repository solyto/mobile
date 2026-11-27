<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import type { DevRequest } from '$lib/types/dev_request';
	import { formatDate } from '$lib/helpers/DateHelper';
	import IconChevronsUpDown from '$lib/icons/lucide/chevrons-up-down.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';
	import { nl2br } from '$lib/helpers/FormatHelper';
	import DOMPurify from 'dompurify';
	import Author from '$lib/components/dev-requests/Author.svelte';
	import Score from '$lib/components/dev-requests/Score.svelte';
	import Priority from '$lib/components/dev-requests/Priority.svelte';
	import Type from '$lib/components/dev-requests/Type.svelte';
	import Status from '$lib/components/dev-requests/Status.svelte';
	import FixedIn from '$lib/components/dev-requests/FixedIn.svelte';
	import Comments from '$lib/components/dev-requests/Comments.svelte';
	import DevRequestEdit from '$lib/components/dev-requests/DevRequestEdit.svelte';
	import EditButton from '$lib/components/ui/buttons/EditButton.svelte';
	import IconMessageSquare from '$lib/icons/lucide/message-square.svelte';

	const ts = getTranslation();
	const devRequests = getDevRequests();

	let { entry, isAdmin, active = false }: {
		entry: DevRequest;
		isAdmin: boolean;
		active?: boolean;
	} = $props();

	let open = $state<boolean>(active);
	let editOpen = $state<boolean>(false);

	function openScreenshot(): void {
		window.open(devRequests.screenshotUrl(entry), '_blank');
	}

	function openEdit(): void {
		editOpen = true;
	}

	function closeEdit(): void {
		editOpen = false;
	}

	function toggleOpen(): void {
		open = !open;
	}
</script>

{#snippet actions()}
	{#if isAdmin}
		<EditButton onClick={openEdit} title={ts.get.dev.requests.edit} inModal={false} buttonStyle="minimal" />
	{/if}
	<IconChevronsUpDown class="cursor-pointer text-c-neutral-3 transition-all hover:text-c-action" onclick={toggleOpen} />
{/snippet}

{#snippet fixedIn(wrapperClass: string)}
	{#if entry.status === 'completed' && entry.fixed_in_version}
		<div class={wrapperClass}>
			<FixedIn version={entry.fixed_in_version} />
		</div>
	{/if}
{/snippet}

<div
	class="relative flex w-full flex-row rounded-lg border-1 border-d-lightblue bg-c-bg-surface shadow-sm transition-all hover:bg-d-lighterblue dark:border-s-dark dark:hover:bg-s-dark-3"
	transition:fade
>
	<span class="absolute -top-2 left-4 rounded-full border-1 border-d-lightblue bg-c-bg-surface px-1.5 text-[10px] leading-4 text-c-neutral-5 dark:border-s-dark">
		#{entry.id}
	</span>
	<Priority {entry} />
	<div class="flex min-w-0 flex-1 flex-col gap-2 px-4 py-2 md:py-4">
		{#if editOpen}
			<DevRequestEdit {entry} onClose={closeEdit} />
		{/if}
		<div class="flex w-full flex-row flex-wrap items-center gap-x-4 gap-y-2 max-md:items-start md:flex-nowrap">
			<Score {entry} />
			<div class="flex w-full min-w-0 flex-row items-start gap-2 max-md:order-first md:w-1/4">
				<span class="min-w-0 flex-1 text-lg font-bold md:text-base">{entry.title}</span>
				<div class="mt-0.5 flex shrink-0 flex-row items-center gap-2 md:hidden">
					{@render actions()}
				</div>
			</div>
			<div class="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-x-4 gap-y-2 md:flex-none">
				<div class="md:w-56 md:shrink-0">
					<Status {entry} />
				</div>
				<div class="max-md:hidden">
					<Type {entry} />
				</div>
				{@render fixedIn('hidden md:ml-4 md:flex')}
			</div>
			<div class="flex w-full flex-row items-center gap-4 md:ml-auto md:w-auto">
				<Author {entry} />
				<span class="text-sm text-c-neutral-5">{formatDate(entry.created_at)}</span>
				{#if entry.updated_at !== entry.created_at}
					<span class="text-sm text-c-btn">{formatDate(entry.updated_at)}</span>
				{/if}
				<div class="md:hidden">
					<Type {entry} />
				</div>
				<span class="flex w-10 flex-row items-center gap-1 text-c-neutral-4">
					{#if entry.comment_count > 0}
						<IconMessageSquare class="h-4 w-4" />
						<span class="-translate-y-px text-sm">{entry.comment_count}</span>
					{/if}
				</span>
				<div class="hidden flex-row items-center gap-2 md:flex">
					{@render actions()}
				</div>
			</div>
		</div>
		{@render fixedIn('flex md:hidden')}
		{#if open}
			<div class="flex w-full flex-col" transition:slide>
				<div class="mt-2 flex w-full flex-row gap-8" class:min-h-32={entry.screenshot}>
					{#if entry.screenshot}
						<button class="transition-opacity hover:opacity-75" onclick={openScreenshot}>
							<img
								src={devRequests.screenshotUrl(entry)}
								alt={ts.get.dev.requests.screenshot}
								class="aspect-auto w-32 rounded-lg object-cover"
							/>
						</button>
					{/if}
					<div class="w-full">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitised with DOMPurify -->
						{@html DOMPurify.sanitize(nl2br(entry.description))}
					</div>
				</div>
				<Comments {entry} />
			</div>
		{/if}
	</div>
</div>
