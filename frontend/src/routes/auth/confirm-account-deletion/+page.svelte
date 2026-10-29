<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { urls, getDeepLinkUrl } from '$lib/config/urls';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { scale } from 'svelte/transition';
	import StaggeredLogo from '$lib/components/ui/StaggeredLogo.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';

	const auth = getAuth();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	const CARD = 'mb-4 flex flex-col gap-4 rounded-lg border-2 border-white/5 bg-c-bg-surface px-8 pt-6 pb-8 shadow-sm md:min-w-80';

	const deepLinkUrl = getDeepLinkUrl(page.url.searchParams.get('platform'));

	let token = $state<string>('');
	let email = $state<string>('');
	let invalidLink = $state<boolean>(false);
	let failed = $state<boolean>(false);
	let done = $state<boolean>(false);

	onMount(() => {
		token = page.url.searchParams.get('token') ?? '';
		email = page.url.searchParams.get('email') ?? '';

		if (!token || !email) {
			invalidLink = true;
		}
	});

	async function confirmDeletion(): Promise<void> {
		failed = false;
		loadingIndicator.start();
		try {
			const result = await auth.confirmAccountDeletion(token, email);
			if (result.success) {
				done = true;
			} else if (Array.isArray(result.errors) ? result.errors.includes('invalid_token') : result.errors != null) {
				invalidLink = true;
			} else {
				failed = true;
			}
		} catch {
			failed = true;
		} finally {
			loadingIndicator.stop();
		}
	}
</script>

<div class="flex w-full max-w-xs flex-col items-center gap-12">
	<div style="width: 56px; height: 71px;">
		<StaggeredLogo path="../" />
	</div>

	{#if done}
		<div class={CARD} in:scale>
			<p class="text-sm dark:text-white">{ts.get.auth.confirm_deletion_success}</p>
			{#if deepLinkUrl}
				<TextButton title={ts.get.auth.open_in_app} href={deepLinkUrl} align="center" class="w-full" />
			{/if}
		</div>
	{:else if invalidLink}
		<div class={CARD} in:scale>
			<p class="text-sm dark:text-white">{ts.get.auth.confirm_deletion_invalid}</p>
			<TextButton title={ts.get.auth.sign_in} href={urls.login} align="center" class="w-full" />
		</div>
	{:else}
		<div class={CARD}>
			<p class="text-base font-bold dark:text-white">{ts.get.auth.confirm_deletion_title}</p>
			<p class="text-sm dark:text-white">{ts.get.auth.confirm_deletion_warning.replace('%s', email)}</p>
			{#if failed}
				<p class="pl-2 text-xs text-red-500">{ts.get.auth.confirm_deletion_error}</p>
			{/if}
			<div class="mt-2">
				<TextButton title={ts.get.auth.confirm_deletion_submit} type="danger" class="w-full" onclick={confirmDeletion} />
			</div>
		</div>
	{/if}
</div>
