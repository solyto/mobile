<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import TagSettings from '$lib/components/settings/TagSettings.svelte';
	import NotificationSettings from '$lib/components/settings/notifications/NotificationSettings.svelte';
	import LocalizationSettings from '$lib/components/settings/LocalizationSettings.svelte';
	import FeatureSettings from '$lib/components/settings/FeatureSettings.svelte';
	import PluginSettings from '$lib/components/settings/PluginSettings.svelte';
	import AppearanceSettings from '$lib/components/settings/AppearanceSettings.svelte';
	import AppSettings from '$lib/components/settings/AppSettings.svelte';
	import ExportSettings from '$lib/components/settings/ExportSettings.svelte';
	import SecuritySettings from '$lib/components/settings/SecuritySettings.svelte';
	import SettingsNavigationMobile from '$lib/components/settings/SettingsNavigationMobile.svelte';
	import SettingsNavigationDesktop from '$lib/components/settings/SettingsNavigationDesktop.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';

	const ts = getTranslation();
	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();

	onMount(async () => {
		loadingIndicator.start();
		await tags.load();
		loadingIndicator.stop();
	});

	const sections = $derived([
		{ id: 6, title: ts.get.settings.appearance, component: AppearanceSettings },
		{ id: 3, title: ts.get.settings.localization, component: LocalizationSettings },
		{ id: 4, title: ts.get.settings.features, component: FeatureSettings },
		{ id: 5, title: ts.get.settings.notifications, component: NotificationSettings },
		{ id: 2, title: ts.get.settings.tags, component: TagSettings },
		{ id: 10, title: ts.get.settings.plugins, component: PluginSettings },
		{ id: 8, title: ts.get.settings.security, component: SecuritySettings },
		{ id: 9, title: ts.get.settings.export_data, component: ExportSettings },
		{ id: 7, title: ts.get.settings.app, component: AppSettings }
	]);

	let active = $state<number>(6);
	let scrollContainer = $state<HTMLElement | null>(null);
	let programmaticScroll = false;

	function sectionId(id: number): string {
		return `settings-section-${id}`;
	}

	function scrollToSection(id: number): void {
		active = id;
		const element = scrollContainer?.querySelector<HTMLElement>(`#${sectionId(id)}`);
		if (!element) return;
		programmaticScroll = true;
		const instant = document.documentElement.classList.contains('no-animations');
		element.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
		window.setTimeout(() => (programmaticScroll = false), 700);
	}

	function updateActive(): void {
		const container = scrollContainer;
		if (programmaticScroll || !container) return;

		if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
			active = sections[sections.length - 1].id;
			return;
		}

		const threshold = 96;
		const containerTop = container.getBoundingClientRect().top;
		let current = sections[0].id;
		for (const section of sections) {
			const element = document.getElementById(sectionId(section.id));
			if (!element) continue;
			if (element.getBoundingClientRect().top - containerTop <= threshold) {
				current = section.id;
			} else {
				break;
			}
		}
		active = current;
	}

	onMount(() => {
		const container = scrollContainer;
		if (!container) return;

		let ticking = false;
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				updateActive();
				ticking = false;
			});
		};

		container.addEventListener('scroll', onScroll, { passive: true });
		updateActive();
		return () => container.removeEventListener('scroll', onScroll);
	});
</script>

<div class="relative flex h-full w-full flex-row overflow-hidden">
	<SettingsNavigationMobile {sections} {active} onselect={scrollToSection} />
	<SettingsNavigationDesktop {sections} {active} onselect={scrollToSection} />
	<div
		bind:this={scrollContainer}
		class="min-h-0 flex-1 overflow-auto p-4 max-md:pt-20 lg:px-8 lg:pt-5 2xl:pt-7"
	>
		<div class="flex flex-col gap-16 pb-8">
			{#each sections as section (section.id)}
				<section id={sectionId(section.id)} class="relative scroll-mt-24 lg:scroll-mt-8">
					<Heading title={section.title} my={0} mb={6} />
					<section.component />
				</section>
			{/each}
		</div>
	</div>
</div>
