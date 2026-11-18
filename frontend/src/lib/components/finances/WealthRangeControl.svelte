<script lang="ts">
	import SegmentedControl from '$lib/components/forms/SegmentedControl.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { wealthRanges, type WealthRangeKey } from '$lib/services/WealthStatisticsService';

	let { value = $bindable() }: { value: WealthRangeKey } = $props();

	const ts = getTranslation();

	function options(): { label: string; value: WealthRangeKey }[] {
		return (Object.keys(wealthRanges) as WealthRangeKey[]).map((key) => ({
			label: ts.get.finances[`range_${key}`],
			value: key
		}));
	}
</script>

<SegmentedControl bind:value options={options()} />
