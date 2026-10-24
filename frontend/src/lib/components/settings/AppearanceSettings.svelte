<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getThemeState } from '$lib/state/Theme.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';
	import { themes, type Theme } from '$lib/config/themes';
	import Toggle from '$lib/components/forms/Toggle.svelte';

	const ts = getTranslation();
	const themeState = getThemeState();

	const colorModeOptions = $derived([
		{ value: 'system' as const, label: ts.get.settings.appearance_system },
		{ value: 'light' as const, label: ts.get.settings.appearance_light },
		{ value: 'dark' as const, label: ts.get.settings.appearance_dark }
	]);

	function supportsNavigationOptions(): boolean {
		return themeState.theme.supportsFlatNavigation || themeState.theme.supportsBottomNavigation;
	}

	function isActive(theme: Theme): boolean {
		return themeState.theme.id === theme.id;
	}
</script>

<div class="flex flex-col gap-6">
	<SettingsSection label={ts.get.settings.theme}>
		<div class="mt-2 flex flex-wrap items-stretch gap-3">
			{#each themes as t (t.id)}
				<button
					class="cursor-pointer overflow-hidden rounded-lg border-2 transition-all"
					style="border-color: {isActive(t) ? t.previewAccent : 'transparent'};"
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
	{#if themeState.theme.supportsDarkMode}
		<SettingsSection label={ts.get.settings.color_mode}>
			<div class="mt-2 flex items-center gap-1">
				{#each colorModeOptions as option (option.value)}
					<button
						class="cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-all hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
						class:bg-c-neutral-1={themeState.appearance === option.value}
						class:dark:bg-s-dark-3={themeState.appearance === option.value}
						onclick={() => themeState.setAppearance(option.value)}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</SettingsSection>
	{/if}
	{#if supportsNavigationOptions()}
		<SettingsSection label={ts.get.settings.flat_navigation}>
			<div class="mt-2 flex flex-col gap-2">
				{#if themeState.theme.supportsFlatNavigation}
					<Toggle
						checked={themeState.flatNavigation}
						label={ts.get.settings.flat_navigation_label}
						onchange={(v) => themeState.setFlatNavigation(v)}
					/>
				{/if}
				{#if themeState.theme.supportsBottomNavigation}
					<Toggle
						checked={themeState.bottomNavigation}
						label={ts.get.settings.bottom_navigation_label}
						onchange={(v) => themeState.setBottomNavigation(v)}
					/>
				{/if}
			</div>
		</SettingsSection>
	{/if}
	<SettingsSection label={ts.get.settings.animations}>
		<div class="mt-2">
			<Toggle
				checked={themeState.animations}
				label={ts.get.settings.animations_label}
				onchange={(v) => themeState.setAnimations(v)}
			/>
		</div>
	</SettingsSection>
</div>
