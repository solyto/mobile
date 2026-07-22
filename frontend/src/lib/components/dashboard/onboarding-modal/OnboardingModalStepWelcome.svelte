<script lang="ts">
	import { blur } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconSparkles from '@lucide/svelte/icons/sparkles';

	const ts = getTranslation();
</script>

<div class="text-center" in:blur={{ duration: 200 }}>
	<div
		class="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-c-btn/20 to-c-success/20"
	>
		<IconSparkles class="size-10 text-c-btn" />
	</div>
	<h1 class="mb-2 text-3xl font-bold text-c-neutral-9 dark:text-white">
		{ts.get.welcome_tour.welcome_title}
	</h1>
	<p class="mb-4 text-lg font-medium text-c-btn">{ts.get.welcome_tour.welcome_subtitle}</p>
	<p class="mx-auto max-w-md leading-relaxed text-c-neutral-6 dark:text-c-neutral-4">
		{ts.get.welcome_tour.welcome_description}
	</p>
</div>
