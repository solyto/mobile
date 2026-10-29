<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { urls } from '$lib/config/urls';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import StaggeredLogo from '$lib/components/ui/StaggeredLogo.svelte';
	import ResendVerificationForm from '$lib/components/auth/ResendVerificationForm.svelte';

	const auth = getAuth();
	const ts = getTranslation();

	onMount(() => {
		if (auth.loggedIn) goto(resolve(urls.home));
	});
</script>

<div class="flex w-full max-w-xs flex-col items-center gap-12">
	<div style="width: 56px; height: 71px;">
		<StaggeredLogo path="../" />
	</div>

	<div class="mb-4 flex flex-col gap-4 rounded-lg border-2 border-white/5 bg-c-bg-surface px-8 pt-6 pb-8 shadow-sm md:min-w-80">
		<ResendVerificationForm title={ts.get.auth.resend_verification_title} hint={ts.get.auth.resend_verification_hint} />
		<div class="flex justify-center pt-1">
			<a href={resolve(urls.login)} class="cursor-pointer text-xs text-gray-400 hover:text-gray-600 dark:text-white/50 dark:hover:text-white/80">
				{ts.get.auth.login}
			</a>
		</div>
	</div>
</div>
