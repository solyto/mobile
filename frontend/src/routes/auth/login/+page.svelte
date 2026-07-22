<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	import { fade } from 'svelte/transition';
	import { startAuthentication } from '@simplewebauthn/browser';
	import IconFingerprint from '@lucide/svelte/icons/fingerprint';
	import IconSettings from '@lucide/svelte/icons/settings';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import StaggeredLogo from '$lib/components/ui/StaggeredLogo.svelte';
	import { PLATFORM, getApiUrl, getPwaApiUrl } from '$lib/config/platform';

	function getApiLabel(): string {
		const url = getApiUrl();
		if (url === getPwaApiUrl()) return 'solyto.app';
		try {
			return new URL(url).hostname;
		} catch {
			return url;
		}
	}

	const auth = getAuth();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let email = $state<string>('');
	let emailError = $state<boolean>(false);
	let password = $state<string>('');
	let passwordError = $state<boolean>(false);
	let error = $state<boolean>(false);
	let passkeySupported = $state(false);

	onMount(() => {
		if (auth.loggedIn) goto(resolve(urls.home));
		passkeySupported = typeof window !== 'undefined' && !!window.PublicKeyCredential;
	});

	async function onsubmit(e: SubmitEvent): Promise<void> {
		e.preventDefault();

		if (!validateInput()) return;

		loadingIndicator.start();
		let success = await auth.login(email, password);
		loadingIndicator.stop();

		if (success) {
			ts.loadLanguage();
			notifications.success(ts.get.auth.login_success);
			await goto(resolve(urls.home));
		} else {
			notifications.error(ts.get.auth.login_error);
			error = true;
		}
	}

	async function signInWithPasskey(): Promise<void> {
		loadingIndicator.start();
		try {
			const options = await auth.passkeyAuthenticationOptions();
			if (!options) throw new Error('No options');
			const response = await startAuthentication({ optionsJSON: options });
			await auth.passkeyAuthenticate(response);
			ts.loadLanguage();
			notifications.success(ts.get.auth.login_success);
			await goto(resolve(urls.home));
		} catch (e) {
			notifications.error(ts.get.auth.passkey_error);
		} finally {
			loadingIndicator.stop();
		}
	}

	function validateInput(): boolean {
		emailError = false;
		passwordError = false;
		emailError = email === '';
		passwordError = password === '';
		error = passwordError || emailError;

		return !(emailError || passwordError);
	}
</script>

{#if PLATFORM !== 'web'}
	<a
		href={urls.setup}
		class="fixed top-10 right-4 flex items-center gap-2 text-c-neutral-5 transition-colors hover:text-c-btn dark:text-c-neutral-4 dark:hover:text-c-btn"
	>
		<span class="text-xs">{getApiLabel()}</span>
		<IconSettings size={24} />
	</a>
{/if}

<div class="flex w-full max-w-xs flex-col items-center gap-12" class:animate-shake={error}>
	<div style="width: 56px; height: 71px;">
		<StaggeredLogo path="../" />
	</div>
	<form
		class="mb-4 relative flex flex-col gap-4 rounded-lg border-2 border-white/5 bg-white px-8 pt-6 pb-8 shadow-sm md:min-w-80 dark:bg-s-dark-2"
		{onsubmit}
	>
		<label class="label">
			<div class="label-text mb-2 text-sm font-bold dark:text-white">{ts.get.auth.email}</div>
			<TextInput bind:value={email} tabindex={1} />
			{#if emailError}
				<p class="mt-2 pl-2 text-xs text-red-500" in:fade>{ts.get.auth.email_error}</p>
			{/if}
		</label>
		<label class="label">
			<div class="label-text mb-2 flex items-center justify-between">
				<span class="text-sm font-bold dark:text-white">{ts.get.auth.password}</span>
				<a
					href={urls.forgotPassword}
					class="text-xs text-c-neutral-5 transition-colors hover:text-c-btn dark:text-c-neutral-4 dark:hover:text-c-btn"
				>
					{ts.get.auth.forgot_password}
				</a>
			</div>
			<PasswordInput bind:value={password} showToggle tabindex={2} />
			{#if passwordError}
				<p class="mt-2 pl-2 text-xs text-red-500" in:fade>{ts.get.auth.password_error}</p>
			{/if}
		</label>
		<div class="mt-4 flex items-center justify-end">
			<TextButton title={ts.get.auth.sign_in} class="w-full" />
		</div>
	</form>
	{#if passkeySupported}
		<div class="mt-3 flex justify-center">
			<button
				type="button"
				onclick={signInWithPasskey}
				class="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm text-c-neutral-5 transition-colors hover:text-c-btn dark:text-c-neutral-4 dark:hover:text-c-btn"
			>
				<IconFingerprint size={16} />
				{ts.get.auth.passkey_sign_in}
			</button>
		</div>
	{/if}
	<div class="flex items-center gap-2 text-sm text-c-neutral-5 dark:text-c-neutral-4">
		<span>{ts.get.auth.no_account}</span>
		<a
			href={urls.register}
			class="font-medium text-c-btn transition-colors hover:underline"
		>
			{ts.get.auth.register_link}
		</a>
	</div>
</div>
