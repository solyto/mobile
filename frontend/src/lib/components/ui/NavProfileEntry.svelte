<script lang="ts">
	import NavEntry from '$lib/components/ui/NavEntry.svelte';
	import { urls } from '$lib/config/urls';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';

	const auth = getAuth();
	const ts = getTranslation();

	let {
		active = false,
		mobile = false,
		onSelect = () => {}
	}: {
		active?: boolean;
		mobile?: boolean;
		onSelect?: () => void;
	} = $props();

	// The profile image is fetched cross-origin from the API's storage; a
	// transient failure (e.g. cold browser session) breaks the <img> with no
	// retry. Retry once with a cache-buster, then fall back to the initial
	// letter instead of showing a broken image.
	let retriedPath = $state<string | null>(null);
	let failedPath = $state<string | null>(null);

	const imagePath = $derived(auth.user?.profile?.profile_image_path ?? null);
	const imageSrc = $derived(
		imagePath
			? `${API_USER_STORAGE_URL}/${imagePath}${retriedPath === imagePath ? '?retry=1' : ''}`
			: null
	);

	function handleError() {
		if (retriedPath !== imagePath) {
			retriedPath = imagePath;
			return;
		}
		failedPath = imagePath;
	}
</script>

<NavEntry
	slug="profile"
	href={urls.profile}
	title={ts.get.nav.profile}
	{active}
	{mobile}
	{onSelect}
>
	<div class="flex size-10 items-center justify-center rounded-full bg-c-neutral-2 text-c-avatar-text">
		{#if imageSrc && failedPath !== imagePath}
			<img
				src={imageSrc}
				alt="Profile"
				class="h-full w-full rounded-full object-cover"
				onerror={handleError}
			/>
		{:else}
			{auth.user?.name?.[0]?.toUpperCase()}
		{/if}
	</div>
</NavEntry>
