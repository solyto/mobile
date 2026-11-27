<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { urls } from '$lib/config/urls';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { fade } from 'svelte/transition';
	import StaggeredLogo from '$lib/components/ui/StaggeredLogo.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { PLATFORM } from '$lib/config/platform';
	import ResendButton from '$lib/components/auth/ResendButton.svelte';
	import { Cooldown } from '$lib/helpers/Cooldown.svelte';

	const RESEND_COOLDOWN_SECONDS = 60;

	const auth = getAuth();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let email = $state<string>('');
	let emailError = $state<boolean>(false);
	let sent = $state<boolean>(false);
	const cooldown = new Cooldown(RESEND_COOLDOWN_SECONDS);

	onMount(() => {
		if (auth.loggedIn) goto(resolve(urls.home));
	});

	onDestroy(() => cooldown.destroy());

	async function onsubmit(e: SubmitEvent): Promise<void> {
		e.preventDefault();
		emailError = email === '';
		if (emailError) return;

		await send();
		sent = true;
	}

	async function resend(): Promise<void> {
		if (cooldown.active) return;
		await send();
	}

	async function send(): Promise<void> {
		loadingIndicator.start();
		try {
			await auth.forgotPassword(email, PLATFORM);
		} finally {
			loadingIndicator.stop();
		}
		cooldown.start();
	}

	function goToLogin(): void {
		goto(resolve(urls.login));
	}
</script>

<div class="flex w-full max-w-xs flex-col items-center gap-12">
	<div style="width: 56px; height: 71px;">
		<StaggeredLogo />
	</div>

	{#if sent}
		<div
			class="mb-4 flex flex-col gap-4 rounded-lg border-2 border-white/5 bg-c-bg-surface px-8 pt-6 pb-8 shadow-sm md:min-w-80"
			in:fade
		>
			<div>
				<p class="text-base font-bold dark:text-white">{ts.get.auth.forgot_password_sent_title}</p>
				<p class="mt-1 text-sm dark:text-white/70">
					{ts.get.auth.forgot_password_sent_desc.replace('%s', email)}
				</p>
			</div>
			<ResendButton {cooldown} onclick={resend} />
			<button
				type="button"
				class="cursor-pointer text-xs text-gray-400 hover:text-gray-600 dark:text-white/50 dark:hover:text-white/80"
				onclick={goToLogin}
			>
				{ts.get.auth.login}
			</button>
		</div>
	{:else}
		<form
			class="mb-4 flex flex-col gap-4 rounded-lg border-2 border-white/5 bg-c-bg-surface px-8 pt-6 pb-8 shadow-sm md:min-w-80"
			{onsubmit}
		>
			<div>
				<p class="text-base font-bold dark:text-white">{ts.get.auth.forgot_password}</p>
				<p class="mt-1 text-sm dark:text-white/70">{ts.get.auth.forgot_password_hint}</p>
			</div>
			<label class="label">
				<div class="label-text mb-2 text-sm font-bold dark:text-white">{ts.get.auth.email}</div>
				<TextInput bind:value={email} />
				{#if emailError}
					<p class="mt-2 pl-2 text-xs text-red-500" in:fade>{ts.get.auth.email_error}</p>
				{/if}
			</label>
			<div class="mt-2">
				<TextButton title={ts.get.auth.forgot_password_send} class="w-full" />
			</div>
			<div class="flex justify-center pt-1">
				<a href={resolve(urls.login)} class="cursor-pointer text-xs text-gray-400 hover:text-gray-600 dark:text-white/50 dark:hover:text-white/80">
					{ts.get.auth.login}
				</a>
			</div>
		</form>
	{/if}
</div>
