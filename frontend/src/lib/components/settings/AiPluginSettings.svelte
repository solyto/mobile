<script lang="ts">
	import { onMount } from 'svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getPlugins } from '$lib/state/Plugins.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import PluginService from '$lib/services/PluginService';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import type { AiPluginDraft, AiProviderId, UpdateAiPluginRequest } from '$lib/types/plugin';

	const ts = getTranslation();
	const plugins = getPlugins();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const pluginService = new PluginService();

	const HINT = 'text-sm text-c-neutral-5';

	let loadAttempted = $state<boolean>(false);
	let draft = $state<AiPluginDraft>(pluginService.toDraft(null));

	onMount(async () => {
		loadingIndicator.start();
		await plugins.load();
		draft = pluginService.toDraft(plugins.ai);
		loadAttempted = true;
		loadingIndicator.stop();
	});

	function providerOptions(): { label: string; value: string }[] {
		const options = plugins.aiProviders.map((p) => ({ label: p.name, value: p.provider }));
		return [{ label: ts.get.settings.ai_plugin_select_provider, value: '' }, ...options];
	}

	function modelOptions(): { label: string; value: string }[] {
		const options = pluginService.modelsOf(plugins.aiProviders, draft.provider).map((m) => ({ label: m.name, value: m.id }));
		return [{ label: ts.get.settings.ai_plugin_select_model, value: '' }, ...options];
	}

	async function onEnabled(value: boolean): Promise<void> {
		draft.enabled = value;
		if (value || !plugins.ai?.enabled) return;

		const saved = await submit(pluginService.buildDisableRequest(plugins.ai));
		if (!saved) draft.enabled = true;
	}

	function onProvider(value: string): void {
		draft.provider = value === '' ? null : (value as AiProviderId);
		draft.model = null;
	}

	function onModel(value: string): void {
		draft.model = value === '' ? null : value;
	}

	async function save(): Promise<boolean> {
		return submit(pluginService.buildRequest(draft));
	}

	async function submit(request: UpdateAiPluginRequest | null): Promise<boolean> {
		if (request === null) {
			notifications.error(ts.get.settings.ai_plugin_save_error);
			return false;
		}

		loadingIndicator.start();
		const ok = await plugins.updateAi(request);
		loadingIndicator.stop();

		if (!ok) {
			notifications.error(ts.get.settings.ai_plugin_save_error);
			return false;
		}
		draft = pluginService.toDraft(plugins.ai);
		notifications.success(ts.get.settings.ai_plugin_saved);
		return true;
	}
</script>

{#if loadAttempted && !plugins.loaded}
	<p class={HINT}>{ts.get.settings.ai_plugin_load_error}</p>
{:else if loadAttempted}
	<div class="flex w-full max-w-xl flex-col gap-6">
		<p class={HINT}>{ts.get.settings.ai_plugin_description}</p>
		<div class="flex w-full justify-between">
			<span>{ts.get.settings.ai_plugin_enabled}</span>
			<Toggle checked={draft.enabled} onchange={onEnabled} />
		</div>
		{#if draft.enabled}
			<SettingsSection label={ts.get.settings.ai_plugin_provider}>
				<Select value={draft.provider ?? ''} options={providerOptions()} onchange={onProvider} />
			</SettingsSection>
			<SettingsSection label={ts.get.settings.ai_plugin_model}>
				{#if plugins.ai?.model_available === false}
					<p class="mb-2 text-sm text-c-danger">{ts.get.settings.ai_plugin_model_unavailable}</p>
				{/if}
				<Select value={draft.model ?? ''} options={modelOptions()} onchange={onModel} />
			</SettingsSection>
			<SettingsSection label={ts.get.settings.ai_plugin_api_key}>
				{#if plugins.ai?.has_api_key}
					<p class="mb-2 {HINT}">{ts.get.settings.ai_plugin_api_key_stored}</p>
					<PasswordInput bind:value={draft.apiKey} placeholder={ts.get.settings.ai_plugin_api_key_replace_placeholder} />
				{:else}
					<PasswordInput bind:value={draft.apiKey} placeholder={ts.get.settings.ai_plugin_api_key_placeholder} />
					{#if pluginService.needsApiKey(plugins.ai, draft)}
						<p class="mt-2 {HINT}">{ts.get.settings.ai_plugin_api_key_required}</p>
					{/if}
				{/if}
			</SettingsSection>
			<div class="flex justify-end">
				<TextButton
					title={ts.get.layout.save}
					type="primary"
					disabled={!pluginService.canSave(plugins.ai, plugins.aiProviders, draft)}
					onclick={save}
				/>
			</div>
		{/if}
	</div>
{/if}
