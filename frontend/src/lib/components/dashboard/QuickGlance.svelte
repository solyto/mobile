<script lang="ts">
	import { blur } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';

	import TimeTrackingWidget from '$lib/components/dashboard/widgets/TimeTrackingWidget.svelte';
	import CheckInWidget from '$lib/components/dashboard/widgets/CheckInWidget.svelte';
	import ShortcutsWidget from '$lib/components/dashboard/widgets/ShortcutsWidget.svelte';

	const ts = getTranslation();
</script>

<div class="flex flex-col gap-12" in:blur>
	<CheckInWidget {ts} />
	<TimeTrackingWidget {ts} />
	<ShortcutsWidget {ts} />
</div>