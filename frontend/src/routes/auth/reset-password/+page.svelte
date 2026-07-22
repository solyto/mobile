<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { urls, getDeepLinkUrl } from '$lib/config/urls';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { fade, scale } from 'svelte/transition';
	import StaggeredLogo from '$lib/components/ui/StaggeredLogo.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import PasswordStrengthIndicator from '$lib/components/forms/PasswordStrengthIndicator.svelte';
	import PasswordMatchIndicator from '$lib/components/forms/PasswordMatchIndicator.svelte';

	const auth = getAuth();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	const deepLinkUrl = getDeepLinkUrl(page.url.searchParams.get('platform'));

	let token = $state<string>('');
	let email = $state<string>('');
	let password = $state<string>('');
	let passwordConfirmation = $state<string>('');
	let passwordError = $state<boolean>(false);
	let confirmError = $state<boolean>(false);
	let passwordCompromisedError = $state<boolean>(false);
	let failed = $state<boolean>(false);
	let done = $state<boolean>(false);
	let invalidLink = $state<boolean>(false);

	onMount(() => {
		token = page.url.searchParams.get('token') ?? '';
		email = page.url.searchParams.get('email') ?? '';

		if (!token || !email) {
			invalidLink = true;
		}
	});

	async function onsubmit(e: SubmitEvent): Promise<void> {
		e.preventDefault();
		passwordError = password.length < 12;
		confirmError = password !== passwordConfirmation;
		passwordCompromisedError = false;
		if (passwordError || confirmError) return;

		loadingIndicator.start();
		const result = await auth.resetPassword(token, email, password, passwordConfirmation);
		loadingIndicator.stop();

		if (result.success) {
			done = true;
			notifications.success(ts.get.auth.reset_password_success);
		} else if (result.errors?.password) {
			passwordCompromisedError = true;
		} else {
			failed = true;
		}
	}
</script>

<div class="flex w-full max-w-xs flex-col items-center gap-12">
	<div style="width: 56px; height: 71px;">
		<StaggeredLogo path="../" />
	</div>

	{#if invalidLink || failed}
		<div
			class="mb-4 flex flex-col gap-4 rounded-lg border-2 border-white/5 bg-white px-8 pt-6 pb-8 shadow-sm md:min-w-80 dark:bg-s-dark-2"
			in:scale
		>
			<p class="text-sm dark:text-white">{ts.get.auth.reset_password_invalid}</p>
			<TextButton
				title={ts.get.auth.forgot_password_send}
				href={urls.forgotPassword}
				align="center"
				class="w-full"
			/>
		</div>
	{:else if done}
		<div
			class="mb-4 flex flex-col gap-4 rounded-lg border-2 border-white/5 bg-white px-8 pt-6 pb-8 shadow-sm md:min-w-80 dark:bg-s-dark-2"
			in:scale
		>
			<p class="text-sm dark:text-white">{ts.get.auth.reset_password_success}</p>
			{#if deepLinkUrl}
				<TextButton title={ts.get.auth.open_in_app} href={deepLinkUrl} align="center" class="w-full" />
				<div class="flex justify-center">
					<a
						href={urls.login}
						class="text-xs text-c-neutral-5 transition-colors hover:text-c-btn dark:text-c-neutral-4 dark:hover:text-c-btn"
					>
						{ts.get.auth.sign_in}
					</a>
				</div>
			{:else}
				<TextButton title={ts.get.auth.sign_in} href={urls.login} align="center" class="w-full" />
			{/if}
		</div>
	{:else}
		<form
			class="mb-4 flex flex-col gap-4 rounded-lg border-2 border-white/5 bg-white px-8 pt-6 pb-8 shadow-sm md:min-w-80 dark:bg-s-dark-2"
			{onsubmit}
		>
			<p class="text-base font-bold dark:text-white">{ts.get.auth.reset_password_title}</p>
			<label class="label">
				<div class="label-text mb-2 text-sm font-bold dark:text-white">
					{ts.get.auth.reset_password_new}
				</div>
				<PasswordInput bind:value={password} showToggle />
				<PasswordStrengthIndicator {password} />
				{#if passwordError}
					<p class="mt-2 pl-2 text-xs text-red-500" in:fade>{ts.get.auth.password_error}</p>
				{/if}
				{#if passwordCompromisedError}
					<p class="mt-2 pl-2 text-xs text-red-500" in:fade>{ts.get.auth.password_compromised}</p>
				{/if}
			</label>
			<label class="label">
				<div class="label-text mb-2 text-sm font-bold dark:text-white">
					{ts.get.auth.reset_password_confirm}
				</div>
				<PasswordInput bind:value={passwordConfirmation} showToggle />
				<PasswordMatchIndicator {password} {passwordConfirmation} />
				{#if confirmError}
					<p class="mt-2 pl-2 text-xs text-red-500" in:fade>
						{ts.get.auth.password_confirmation_error}
					</p>
				{/if}
			</label>
			<div class="mt-2">
				<TextButton title={ts.get.auth.reset_password_submit} class="w-full" />
			</div>
		</form>
	{/if}
</div>
