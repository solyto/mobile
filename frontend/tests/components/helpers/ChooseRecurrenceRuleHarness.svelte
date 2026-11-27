<script lang="ts">
	import ChooseRecurrenceRule from '$lib/components/calendars/ChooseRecurrenceRule.svelte';
	import RecurrenceRuleService from '$lib/services/RecurrenceRuleService';

	let { rule, startDate }: { rule: string; startDate: Date } = $props();

	// svelte-ignore state_referenced_locally
	let selection = $state(new RecurrenceRuleService().parse(rule, startDate, 'UTC')!);
</script>

<ChooseRecurrenceRule bind:selection {startDate} />
<span data-testid="interval">{selection.interval}</span>
<span data-testid="type">{selection.type}</span>
