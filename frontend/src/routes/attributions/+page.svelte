<script lang="ts">
	import { onMount } from 'svelte';
	import { asset } from '$app/paths';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import SubHeading from '$lib/components/ui/SubHeading.svelte';
	import { pluralize } from '$lib/helpers/FormatHelper';
	import type { OpenSourceLicense } from '$lib/types/license';

	type LicenseGroup = { license: string; projects: OpenSourceLicense[] };

	const LICENSE_NAMES: Record<string, string> = {
		MIT: 'MIT License',
		ISC: 'ISC License',
		'Apache-2.0': 'Apache License 2.0',
		'OFL-1.1': 'SIL Open Font License 1.1',
		'BSD-3-Clause': 'BSD 3-Clause License',
		'0BSD': 'Zero-Clause BSD License'
	};

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let licenses = $state<OpenSourceLicense[]>([]);
	let groups = $derived(groupByLicense(licenses));

	onMount(async () => {
		loadingIndicator.start();
		licenses = (await import('virtual:licenses')).default;
		loadingIndicator.stop();
	});

	function groupByLicense(list: OpenSourceLicense[]): LicenseGroup[] {
		const byLicense = new Map<string, OpenSourceLicense[]>();
		for (const project of list) {
			byLicense.set(project.license, [...(byLicense.get(project.license) ?? []), project]);
		}

		return [...byLicense.entries()]
			.map(([license, projects]) => ({ license, projects }))
			.sort((a, b) => b.projects.length - a.projects.length || a.license.localeCompare(b.license));
	}

	function licenseName(license: string): string {
		return LICENSE_NAMES[license] ?? license;
	}

	function projectCount(count: number): string {
		return pluralize(count, ts.get.layout.licenses_projects_singular, ts.get.layout.licenses_projects_plural);
	}
</script>

<div class="flex h-full w-full flex-col gap-8 overflow-y-auto px-4 py-4 lg:px-8">
	<div class="flex max-w-3xl flex-col gap-2">
		<Heading title={ts.get.layout.open_source_licenses} my={0} />
		<p class="text-sm text-c-neutral-5">{ts.get.layout.licenses_intro}</p>
	</div>

	{#each groups as group (group.license)}
		<section class="flex flex-col gap-3">
			<div class="flex flex-row flex-wrap items-baseline gap-x-2">
				<SubHeading title={licenseName(group.license)} my={0} />
				<span class="text-sm text-c-neutral-5">{projectCount(group.projects.length)}</span>
			</div>
			<div class="grid grid-cols-1 gap-x-4 md:grid-cols-2 xl:grid-cols-3">
				{#each group.projects as project (`${project.name}@${project.version}`)}
					<a
						href={project.url}
						target="_blank"
						rel="external noopener"
						class="flex min-w-0 items-center gap-1 rounded-sm px-2 py-1 text-sm hover:bg-c-neutral hover:text-c-primary"
					>
						<span class="truncate">{project.name}</span>
						<span class="text-c-neutral-5">{project.version}</span>
					</a>
				{/each}
			</div>
		</section>
	{/each}

	{#if groups.length > 0}
		<a href={asset('/licenses.txt')} target="_blank" rel="external" class="w-fit text-sm text-c-neutral-5 hover:text-c-primary">
			{ts.get.layout.licenses_full_texts}
		</a>
	{/if}
</div>
