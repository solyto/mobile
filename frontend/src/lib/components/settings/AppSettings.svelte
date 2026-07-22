<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getPwaInstall } from '$lib/state/PwaInstall.svelte';
	import { getWelcomeTour } from '$lib/state/WelcomeTour.svelte';
	import { getNavigation } from '$lib/state/Navigation.svelte';
	import { getThemeState } from '$lib/state/Theme.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';
	import IconSmartphone from '@lucide/svelte/icons/smartphone';
	import IconCheckCircle from '@lucide/svelte/icons/check-circle';
	import IconMapPin from '@lucide/svelte/icons/map-pin';
	import { themes } from '$lib/config/themes';
	import { env } from '$env/dynamic/public';
	import { IS_NATIVE, PLATFORM } from '$lib/config/platform';
	import UpdateChecker from '$lib/components/settings/UpdateChecker.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';

	const ts = getTranslation();
	const pwa = getPwaInstall();
	const tour = getWelcomeTour();
	const nav = getNavigation();
	const themeState = getThemeState();

	const version = env.PUBLIC_VERSION;
</script>

<div class="flex flex-col gap-6 md:p-4">
	<SettingsSection label={ts.get.settings.theme}>
		<div class="mt-2 flex flex-wrap items-stretch gap-3">
			{#each themes as t (t.id)}
				{@const active = themeState.theme.id === t.id}
				<button
					class="cursor-pointer overflow-hidden rounded-lg border-2 transition-all"
					style="border-color: {active ? t.previewAccent : 'transparent'};"
					onclick={() => themeState.setTheme(t)}
				>
					<div
						class="flex h-full w-32 flex-col gap-1 p-3"
						style="background-color: {t.previewBg}; color: {t.previewText};"
					>
						<div class="h-2 w-8 rounded-full" style="background-color: {t.previewAccent};"></div>
						<div class="h-1.5 w-16 rounded-full opacity-60" style="background-color: {t.previewText};"></div>
						<div class="h-1.5 w-12 rounded-full opacity-40" style="background-color: {t.previewText};"></div>
						<div class="grow"></div>
						<div
							class="mt-1 rounded px-1.5 py-0.5 text-left text-xs font-medium"
							style="background-color: {t.previewSurface}; color: {t.previewText};"
						>
							{t.name}
						</div>
					</div>
				</button>
			{/each}
		</div>
	</SettingsSection>
	<SettingsSection label={ts.get.settings.animations}>
		<div class="mt-2">
			<Toggle
				checked={themeState.animations}
				label={ts.get.settings.animations_label}
				onchange={(v) => themeState.setAnimations(v)}
			/>
		</div>
	</SettingsSection>
	<SettingsSection label={ts.get.welcome_tour.tour_start}>
		<button
			class="mt-2 flex cursor-pointer items-center gap-2 rounded-lg bg-c-btn px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-c-btn/80"
			onclick={() => tour.start(nav.features)}
		>
			<IconMapPin size={15} />
			{ts.get.welcome_tour.tour_start}
		</button>
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
				<button
					class="mt-4 flex cursor-pointer items-center gap-2 rounded-lg bg-c-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-c-primary/80"
					onclick={() => pwa.install()}
				>
					<IconSmartphone size={15} />
					{ts.get.welcome_tour.pwa_install_button}
				</button>
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
