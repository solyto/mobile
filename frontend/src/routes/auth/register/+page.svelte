<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { fade } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import PasswordStrengthIndicator from '$lib/components/forms/PasswordStrengthIndicator.svelte';
	import PasswordMatchIndicator from '$lib/components/forms/PasswordMatchIndicator.svelte';
	import StaggeredLogo from '$lib/components/ui/StaggeredLogo.svelte';
	import { PLATFORM } from '$lib/config/platform';

	onMount(() => {
		if (auth.loggedIn) {
			goto(resolve(urls.home));
		}
	});

	const auth = getAuth();
	const ts = getTranslation();
	const notifications = getUiNotifications();
	const loadingIndicator = getLoadingIndicator();

	let email = $state<string>('');
	let emailError = $state<boolean>(false);
	let name = $state<string>('');
	let nameError = $state<boolean>(false);
	let password = $state<string>('');
	let passwordError = $state<boolean>(false);
	let passwordCompromisedError = $state<boolean>(false);
	let passwordConfirmation = $state<string>('');
	let passwordConfirmationError = $state<boolean>(false);
	let error = $state<boolean>(false);

	async function onsubmit(e: SubmitEvent): Promise<void> {
		e.preventDefault();

		if (!validateInput()) return;

		loadingIndicator.start();
		const result = await auth.register({
			name,
			email,
			password,
			password_confirmation: passwordConfirmation,
			language: ts.locale,
			platform: PLATFORM
		});
		loadingIndicator.stop();

		if (result.success) {
			notifications.success(ts.get.auth.register_success);
			await goto(resolve(urls.login));
		} else {
			if (result.errors?.password) {
				passwordCompromisedError = true;
			} else {
				notifications.error(ts.get.auth.register_error);
			}
			error = true;
		}
	}

	function validateInput(): boolean {
		nameError = false;
		emailError = false;
		passwordError = false;
		passwordCompromisedError = false;
		passwordConfirmationError = false;
		nameError = name === '';
		emailError = email === '';
		passwordError = password.length < 12;
		passwordConfirmationError =
			passwordConfirmation === '' || password !== passwordConfirmation;
		error = nameError || emailError || passwordError || passwordConfirmationError;

		return !(nameError || emailError || passwordError || passwordConfirmationError);
	}
</script>

<div class="flex w-full max-w-xs flex-col items-center gap-12" class:animate-shake={error}>
	<div style="width: 56px; height: 71px;">
		<StaggeredLogo path="../" />
	</div>
	<form
		class="mb-4 flex flex-col gap-4 rounded-lg border-2 border-white/5 bg-white px-8 pt-6 pb-8 shadow-sm md:min-w-80 dark:bg-s-dark-2"
		{onsubmit}
	>
		<label class="label">
			<div class="label-text mb-2 text-sm font-bold dark:text-white">{ts.get.auth.name}</div>
			<TextInput bind:value={name} />
			{#if nameError}
				<p class="mt-2 pl-2 text-xs text-red-500" in:fade>{ts.get.auth.name_error}</p>
			{/if}
		</label>
		<label class="label">
			<div class="label-text mb-2 text-sm font-bold dark:text-white">{ts.get.auth.email}</div>
			<TextInput bind:value={email} />
			{#if emailError}
				<p class="mt-2 pl-2 text-xs text-red-500" in:fade>{ts.get.auth.email_error}</p>
			{/if}
		</label>
		<label class="label">
			<div class="label-text mb-2 text-sm font-bold dark:text-white">
				{ts.get.auth.password}
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
				{ts.get.auth.password_confirmation}
			</div>
			<PasswordInput bind:value={passwordConfirmation} showToggle />
			<PasswordMatchIndicator {password} {passwordConfirmation} />
			{#if passwordConfirmationError}
				<p class="mt-2 pl-2 text-xs text-red-500" in:fade>
					{ts.get.auth.password_confirmation_error}
				</p>
			{/if}
		</label>
		<div class="mt-4 flex items-center justify-end">
			<TextButton title={ts.get.auth.register} class="w-full" />
		</div>
	</form>
	<div class="flex items-center gap-2 text-sm text-c-neutral-5 dark:text-c-neutral-4">
		<span>{ts.get.auth.have_account}</span>
		<a href={urls.login} class="font-medium text-c-btn transition-colors hover:underline">
			{ts.get.auth.sign_in}
		</a>
	</div>
</div>
