<script lang="ts">
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { createdEntryValue, tagEntries } from '$lib/helpers/MultiSelectHelper';

	const ts = getTranslation();
	const tags = getTags();
	const notifications = getUiNotifications();

	let { value = $bindable(), onchange }: {
		value: MultiSelectEntry[];
		onchange?: (value: MultiSelectEntry[]) => void;
	} = $props();

	function onCreateTag(label: string): Promise<string | null> {
		return createdEntryValue(tags.create(label), () => notifications.error(ts.get.finances.tag_error));
	}
</script>

<MultiSelect bind:value options={tagEntries(tags.tags)} placeholder={ts.get.finances.tags} allowUserOptions oncreate={onCreateTag} {onchange} />
