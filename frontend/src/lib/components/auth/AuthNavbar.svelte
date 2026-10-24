<script lang="ts">
	import { page } from '$app/state';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let loginActive = $derived(page.url.pathname == urls.login);
	let registerActive = $derived(page.url.pathname == urls.register);
</script>

<nav class="absolute top-0 flex items-center justify-between space-x-8 p-4">
	<a href={resolve(urls.login)} class="text-2xl" class:text-white={loginActive}>
		{ts.get.auth.login}
	</a>
	<a href={resolve(urls.register)} class="text-2xl" class:text-white={registerActive}>
		{ts.get.auth.register}
	</a>
</nav>
