<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { urls } from '$lib/config/urls';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import StaggeredLogo from '$lib/components/ui/StaggeredLogo.svelte';

	const auth = getAuth();
	const ts = getTranslation();

	onMount(async () => {
		if (auth.loggedIn) {
			auth.logout();

			await new Promise((resolve) => setTimeout(resolve, 1500));

			window.location.href = env.PUBLIC_REDIRECT_AFTER_LOGOUT || urls.landingPage;
		}
	});
</script>

<div class="flex w-full max-w-xs flex-col items-center gap-12">
	<div style="width: 56px; height: 71px;">
		<StaggeredLogo path="../" />
	</div>
	<div class="mb-4 space-y-4 rounded bg-white px-8 pt-6 pb-8 shadow-md dark:bg-s-dark-2">
		{ts.get.auth.logout_success}
	</div>
</div>
