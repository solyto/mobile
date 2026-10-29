<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getPwaInstall } from '$lib/state/PwaInstall.svelte';
	import { getWelcomeTour } from '$lib/state/WelcomeTour.svelte';
	import { getNavigation } from '$lib/state/Navigation.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconCheckCircle from '@lucide/svelte/icons/check-circle';
	import { env } from '$env/dynamic/public';
	import { IS_NATIVE, PLATFORM } from '$lib/config/platform';
	import UpdateChecker from '$lib/components/settings/UpdateChecker.svelte';

	const ts = getTranslation();
	const pwa = getPwaInstall();
	const tour = getWelcomeTour();
	const nav = getNavigation();

	const version = env.PUBLIC_VERSION;
</script>

<div class="flex flex-col gap-6">
	<SettingsSection label={ts.get.welcome_tour.tour_start}>
		<TextButton
			title={ts.get.welcome_tour.tour_start}
			onclick={() => tour.start(nav.features)}
		/>
	</SettingsSection>
	{#if !IS_NATIVE}
		<SettingsSection label={ts.get.welcome_tour.pwa_title}>
			<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.welcome_tour.pwa_description}
			</p>
			{#if pwa.installed}
				<div class="mt-4 flex items-center gap-2 text-sm text-c-primary">
					<IconCheckCircle size={15} />
					<span>{ts.get.welcome_tour.pwa_installed}</span>
				</div>
			{:else if pwa.canInstall}
				<div class="mt-4">
					<TextButton
						title={ts.get.welcome_tour.pwa_install_button}
						onclick={() => pwa.install()}
					/>
				</div>
			{:else if pwa.isIos}
				<p class="mt-4 text-sm text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.welcome_tour.pwa_ios_instruction}
				</p>
			{:else}
				<p class="mt-4 text-sm text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.welcome_tour.pwa_browser_hint}
				</p>
			{/if}
		</SettingsSection>
	{/if}
	{#if IS_NATIVE && version}
		<SettingsSection label="Version">
			<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{version}</p>
			{#if PLATFORM === 'desktop'}
				<UpdateChecker />
			{/if}
		</SettingsSection>
	{/if}
</div>
