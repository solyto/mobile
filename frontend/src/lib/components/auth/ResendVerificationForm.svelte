<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { PLATFORM } from '$lib/config/platform';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';

	let { title, hint }: { title?: string; hint: string } = $props();

	const auth = getAuth();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let email = $state<string>('');
	let emailError = $state<boolean>(false);
	let sent = $state<boolean>(false);
	let resendCooldown = $state<number>(0);
	let resendTimer: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		return () => {
			if (resendTimer) clearInterval(resendTimer);
		};
	});

	async function send(): Promise<void> {
		loadingIndicator.start();
		try {
			await auth.resendVerification(email, PLATFORM);
		} finally {
			loadingIndicator.stop();
		}
		sent = true;
		startCooldown();
	}

	async function onsubmit(e: SubmitEvent): Promise<void> {
		e.preventDefault();
		emailError = email === '';
		if (emailError) return;
		await send();
	}

	function startCooldown(): void {
		resendCooldown = 60;
		resendTimer = setInterval(() => {
			resendCooldown--;
			if (resendCooldown <= 0 && resendTimer) {
				clearInterval(resendTimer);
				resendTimer = null;
			}
		}, 1000);
	}

	async function resend(): Promise<void> {
		if (resendCooldown > 0) return;
		await send();
	}
</script>

{#if sent}
	<div class="flex flex-col gap-4" in:fade>
		<div>
			<p class="text-base font-bold dark:text-white">{ts.get.auth.forgot_password_sent_title}</p>
			<p class="mt-1 text-sm dark:text-white/70">{ts.get.auth.resend_verification_sent_desc}</p>
		</div>
		<button
			type="button"
			class="mt-2 text-xs text-s-primary disabled:opacity-40"
			disabled={resendCooldown > 0}
			onclick={resend}
		>
			{ts.get.auth.forgot_password_resend}
			{#if resendCooldown > 0}({resendCooldown}s){/if}
		</button>
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
