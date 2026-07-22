<script lang="ts">
	import NavEntry from '$lib/components/ui/NavEntry.svelte';
	import { urls } from '$lib/config/urls';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';

	const auth = getAuth();
	const ts = getTranslation();

	let {
		active = false,
		mobile = false,
		onSelect = () => {}
	} = $props<{
		active?: boolean;
		mobile?: boolean;
		onSelect?: () => void;
	}>();
</script>

<NavEntry slug="profile" href={urls.profile} title={ts.get.nav.profile} {active} {mobile} {onSelect}>
	<div class="flex size-10 items-center justify-center rounded-full bg-c-neutral-2 text-black">
		{#if auth.user?.profile?.profile_image_path}
			<img
				src={API_USER_STORAGE_URL + '/' + auth.user.profile.profile_image_path}
				alt="Profile"
				class="h-full w-full rounded-full object-cover"
			/>
		{:else}
			{auth.user?.name?.[0]?.toUpperCase()}
		{/if}
	</div>
</NavEntry>
