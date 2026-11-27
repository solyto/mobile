<script lang="ts">
	import { getHoursOfDay, isOffHour } from '$lib/helpers/DateHelper';

	const hours = getHoursOfDay();
</script>

{#each hours as hour (hour)}
	<div class="flex items-center justify-center">
		<span
			class="text-xs"
			class:text-c-neutral-4={isOffHour(hour)}
			class:dark:text-s-dark-3={isOffHour(hour)}
		>
			{hour}
		</span>
	</div>
{/each}
