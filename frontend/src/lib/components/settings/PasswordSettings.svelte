<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { urls } from '$lib/config/urls';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { fade } from 'svelte/transition';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import PasswordStrengthIndicator from '$lib/components/forms/PasswordStrengthIndicator.svelte';
	import PasswordMatchIndicator from '$lib/components/forms/PasswordMatchIndicator.svelte';

	const auth = getAuth();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	const LABEL = 'label-text mb-2 text-sm font-bold dark:text-white';

	let currentPassword = $state<string>('');
	let newPassword = $state<string>('');
	let newPasswordConfirmation = $state<string>('');
	let currentPasswordError = $state<string | null>(null);
	let newPasswordError = $state<string | null>(null);
	let confirmError = $state<boolean>(false);

	function validate(): boolean {
		currentPasswordError = currentPassword === '' ? ts.get.settings.current_password_required : null;
		newPasswordError = null;
		if (newPassword.length < 12) newPasswordError = ts.get.auth.password_error;
		else if (newPassword === currentPassword) newPasswordError = ts.get.settings.new_password_same_as_current;
		confirmError = newPassword !== newPasswordConfirmation;

		return currentPasswordError === null && newPasswordError === null && !confirmError;
	}

	async function onsubmit(e: SubmitEvent): Promise<void> {
		e.preventDefault();
		if (!validate()) return;

		loadingIndicator.start();
		const result = await auth.changePassword(currentPassword, newPassword, newPasswordConfirmation);
		loadingIndicator.stop();

		if (result.success) {
			notifications.success(ts.get.settings.password_changed);
			await goto(resolve(urls.login));
		} else if (result.errors?.current_password) {
			currentPasswordError = ts.get.settings.current_password_incorrect;
		} else if (result.errors?.new_password) {
			newPasswordError = ts.get.auth.password_compromised;
		} else {
			notifications.error(ts.get.settings.password_change_error);
		}
	}
</script>

{#snippet error(message: string)}
	<p class="mt-2 pl-2 text-xs text-red-500" in:fade>{message}</p>
{/snippet}

<div class="w-full">
	<form class="flex max-w-sm flex-col gap-4" {onsubmit}>
		<label class="label">
			<div class={LABEL}>{ts.get.settings.current_password}</div>
			<PasswordInput bind:value={currentPassword} showToggle />
			{#if currentPasswordError}
				{@render error(currentPasswordError)}
			{/if}
		</label>
		<label class="label">
			<div class={LABEL}>{ts.get.settings.new_password}</div>
			<PasswordInput bind:value={newPassword} showToggle />
			<PasswordStrengthIndicator password={newPassword} />
			{#if newPasswordError}
				{@render error(newPasswordError)}
			{/if}
		</label>
		<label class="label">
			<div class={LABEL}>{ts.get.settings.confirm_new_password}</div>
			<PasswordInput bind:value={newPasswordConfirmation} showToggle />
			<PasswordMatchIndicator password={newPassword} passwordConfirmation={newPasswordConfirmation} />
			{#if confirmError}
				{@render error(ts.get.auth.password_confirmation_error)}
			{/if}
		</label>
		<div class="mt-2">
			<TextButton title={ts.get.settings.change_password_submit} />
		</div>
	</form>
</div>
