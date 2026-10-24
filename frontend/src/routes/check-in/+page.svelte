<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { urls } from '$lib/config/urls';
	import { getUrlFormat } from '$lib/helpers/DateHelper';

	goto(resolve(urls.checkInDate, { date: getUrlFormat(new Date()) }), { replaceState: true });
</script>
