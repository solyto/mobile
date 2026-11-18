<script lang="ts">
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const ts = getTranslation();
	const tags = getTags();
	const notifications = getUiNotifications();

	let { value = $bindable(), onchange }: {
		value: MultiSelectEntry[];
		onchange?: (value: MultiSelectEntry[]) => void;
	} = $props();

	function tagOptions(): MultiSelectEntry[] {
		return tags.tags.map((tag) => ({ label: tag.name, value: tag.id.toString() }));
	}

	async function onCreateTag(label: string): Promise<string | null> {
		const created = await tags.create(label);
		if (!created) {
			notifications.error(ts.get.finances.tag_error);
			return null;
		}
		return created.id.toString();
	}
</script>

<MultiSelect bind:value options={tagOptions()} placeholder={ts.get.finances.tags} allowUserOptions oncreate={onCreateTag} {onchange} />
