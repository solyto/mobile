<script lang="ts">
	import { CLIENT_VERSION, IS_WEB } from '$lib/config/platform';
	import { fixedInState } from '$lib/helpers/VersionHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { version }: { version: string } = $props();

	const ts = getTranslation();

	function label(): string {
		const state = fixedInState(IS_WEB, CLIENT_VERSION, version);
		if (state === 'included') return ts.get.dev.requests.fixed_in_included.replace('%s', version);
		if (state === 'pending') return ts.get.dev.requests.fixed_in_pending.replace('%s', version);
		return ts.get.dev.requests.fixed_in.replace('%s', version);
	}

	function tooltip(): string | undefined {
		if (fixedInState(IS_WEB, CLIENT_VERSION, version) !== 'pending') return undefined;
		return ts.get.dev.requests.fixed_in_current_version.replace('%s', CLIENT_VERSION);
	}
</script>

<span class="rounded-full bg-c-neutral-1 px-3 py-1 text-xs whitespace-nowrap text-c-neutral-7" title={tooltip()}>
	{label()}
</span>
