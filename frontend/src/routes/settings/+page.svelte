<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { onMount } from 'svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import TodoSettings from '$lib/components/settings/TodoSettings.svelte';
	import TagSettings from '$lib/components/settings/TagSettings.svelte';
	import NotificationSettings from '$lib/components/settings/notifications/NotificationSettings.svelte';
	import LocalizationSettings from '$lib/components/settings/LocalizationSettings.svelte';
	import FeatureSettings from '$lib/components/settings/FeatureSettings.svelte';
	import AppSettings from '$lib/components/settings/AppSettings.svelte';
	import ExportSettings from '$lib/components/settings/ExportSettings.svelte';
	import SecuritySettings from '$lib/components/settings/SecuritySettings.svelte';
	import SettingsNavigationMobile from '$lib/components/settings/SettingsNavigationMobile.svelte';
	import SettingsNavigationDesktop from '$lib/components/settings/SettingsNavigationDesktop.svelte';

	const ts = getTranslation();
	const tags = getTags();
	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();

	onMount(async () => {
		loadingIndicator.start();
		await Promise.all([tags.load(), todos.loadCategories(), todos.loadWorkspaces()]);
		loadingIndicator.stop();
	});

	const sections = $derived([
		{ id: 1, title: ts.get.settings.todos, component: TodoSettings },
		{ id: 2, title: ts.get.settings.tags, component: TagSettings },
		{ id: 3, title: ts.get.settings.localization, component: LocalizationSettings },
		{ id: 4, title: ts.get.settings.features, component: FeatureSettings },
		{ id: 5, title: ts.get.settings.notifications, component: NotificationSettings },
		{ id: 6, title: ts.get.settings.app, component: AppSettings },
		{ id: 7, title: ts.get.settings.security, component: SecuritySettings },
		{ id: 8, title: ts.get.settings.export_data, component: ExportSettings }
	]);

	let selected = $state<number>(1);
	const SelectedComponent = $derived(sections.find((s) => s.id === selected)?.component);
</script>

<div class="relative flex h-full w-full flex-row">
	<SettingsNavigationMobile {sections} {selected} onselect={(id) => (selected = id)} />
	<SettingsNavigationDesktop {sections} {selected} onselect={(id) => (selected = id)} />
	<div class="min-h-0 flex-1 overflow-auto px-4 py-2 max-md:pt-20">
		{#if SelectedComponent}
			<SelectedComponent />
		{/if}
	</div>
</div>
