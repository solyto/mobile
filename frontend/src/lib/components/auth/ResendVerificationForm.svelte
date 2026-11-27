<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { PLATFORM } from '$lib/config/platform';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import ResendButton from '$lib/components/auth/ResendButton.svelte';
	import { Cooldown } from '$lib/helpers/Cooldown.svelte';

	const RESEND_COOLDOWN_SECONDS = 60;

	let { title, hint }: { title?: string; hint: string } = $props();

	const auth = getAuth();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let email = $state<string>('');
	let emailError = $state<boolean>(false);
	let sent = $state<boolean>(false);
	const cooldown = new Cooldown(RESEND_COOLDOWN_SECONDS);

	onDestroy(() => cooldown.destroy());

	async function send(): Promise<void> {
		loadingIndicator.start();
		try {
			await auth.resendVerification(email, PLATFORM);
		} finally {
			loadingIndicator.stop();
		}
		sent = true;
		cooldown.start();
	}

	async function onsubmit(e: SubmitEvent): Promise<void> {
		e.preventDefault();
		emailError = email === '';
		if (emailError) return;
		await send();
	}

	async function resend(): Promise<void> {
		if (cooldown.active) return;
		await send();
	}
</script>

{#if sent}
	<div class="flex flex-col gap-4" in:fade>
		<div>
			<p class="text-base font-bold dark:text-white">{ts.get.auth.forgot_password_sent_title}</p>
			<p class="mt-1 text-sm dark:text-white/70">{ts.get.auth.resend_verification_sent_desc}</p>
		</div>
		<ResendButton {cooldown} onclick={resend} />
	</div>
{:else}
	<form class="flex flex-col gap-4" {onsubmit}>
		<div>
			{#if title}
				<p class="text-base font-bold dark:text-white">{title}</p>
			{/if}
			<p class="mt-1 text-sm dark:text-white/70">{hint}</p>
		</div>
		<label class="label">
			<div class="label-text mb-2 text-sm font-bold dark:text-white">{ts.get.auth.email}</div>
			<TextInput bind:value={email} />
			{#if emailError}
				<p class="mt-2 pl-2 text-xs text-red-500" in:fade>{ts.get.auth.email_error}</p>
			{/if}
		</label>
		<div class="mt-2">
			<TextButton title={ts.get.auth.resend_verification_send} class="w-full" />
		</div>
	</form>
{/if}
