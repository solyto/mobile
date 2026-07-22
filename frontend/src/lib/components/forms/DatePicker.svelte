<!--suppress CssUnusedSymbol -->
<script lang="ts">
	import { DatePicker } from '@svelte-plugins/datepicker';

	let {
		isOpen = $bindable(),
		startDate = $bindable(),
		onChange
	} = $props<{
		isOpen: boolean;
		startDate: Date | null;
		onChange: () => void | Promise<void>;
	}>();
</script>

<DatePicker
	onDateChange={onChange}
	enableFutureDates={true}
	enablePastDates={true}
	startOfWeek="1"
	bind:isOpen
	bind:startDate
	theme="custom-datepicker"
>
	<input type="text" class="hidden" bind:value={startDate} />
</DatePicker>

<style>
	:global(.datepicker[data-picker-theme='custom-datepicker']) {
		--datepicker-container-left: -160px;
		--datepicker-container-top: 10px;
	}
</style>
