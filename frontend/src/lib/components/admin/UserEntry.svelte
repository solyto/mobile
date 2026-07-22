<script lang="ts">
	import type { ManagedUser } from '$lib/types/managed_user';
	import { getUserManagement } from '$lib/state/UserManagement.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconShield from '@lucide/svelte/icons/shield';
	import IconShieldCheck from '@lucide/svelte/icons/shield-check';
	import IconUser from '@lucide/svelte/icons/user';
	import IconBadgeCheck from '@lucide/svelte/icons/badge-check';

	const userManagement = getUserManagement();
	const auth = getAuth();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();

	let { user } = $props<{ user: ManagedUser }>();

	const isSuperAdmin = auth.user?.role === 'super_admin';
	const isCurrentUser = auth.user?.id === user.id;

	const roleOptions: { value: ManagedUser['role']; label: string }[] = isSuperAdmin
		? [
				{ value: 'user', label: 'User' },
				{ value: 'admin', label: 'Admin' },
				{ value: 'super_admin', label: 'Super Admin' }
			]
		: [
				{ value: 'user', label: 'User' },
				{ value: 'admin', label: 'Admin' }
			];

	async function handleRoleChange(event: Event): Promise<void> {
		const target = event.target as HTMLSelectElement;
		const newRole = target.value as ManagedUser['role'];

		if (newRole === user.role) return;

		loadingIndicator.start();
		const success = await userManagement.updateRole(user, newRole);
		loadingIndicator.stop();

		if (success) {
			notifications.success(ts.get.admin.role_update_success);
		} else {
			notifications.error(ts.get.admin.role_update_error);
		}
	}

	function getRoleIcon(role: string) {
		switch (role) {
			case 'super_admin':
				return IconShieldCheck;
			case 'admin':
				return IconShield;
			default:
				return IconUser;
		}
	}

	function getRoleColor(role: string): string {
		switch (role) {
			case 'super_admin':
				return 'text-purple-600 bg-purple-50';
			case 'admin':
				return 'text-blue-600 bg-blue-50';
			default:
				return 'text-c-neutral-6 bg-c-neutral';
		}
	}

	let RoleIcon = $derived(getRoleIcon(user.role));
	let canEditRole = $derived(!isCurrentUser && (isSuperAdmin || user.role !== 'super_admin'));
</script>

<div
	class="flex items-center gap-4 rounded-lg border border-c-neutral-1 bg-white p-4 transition-shadow hover:shadow-sm dark:border-s-dark-3 dark:bg-s-dark-2"
>
	<div class="rounded-full p-2 {getRoleColor(user.role)} dark:bg-opacity-20">
		<RoleIcon class="h-5 w-5" />
	</div>

	<div class="min-w-0 flex-1">
		<p class="truncate font-medium text-c-neutral-9 dark:text-white">{user.name}</p>
		<p class="truncate text-sm text-c-neutral-5 dark:text-c-neutral-4">{user.email}</p>
	</div>

	<div class="flex items-center gap-3">
		{#if user.confirmed}
			<IconBadgeCheck class="h-4 w-4 text-teal-500" />
		{/if}
		{#if canEditRole}
			<select
				class="rounded-lg border border-c-neutral-2 bg-white px-3 py-1.5 text-sm text-c-neutral-7 focus:border-transparent focus:ring-2 focus:ring-c-btn-hover focus:outline-none dark:border-s-dark-3 dark:bg-s-dark-3 dark:text-c-neutral-2"
				value={user.role}
				onchange={handleRoleChange}
			>
				{#each roleOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		{:else}
			<span
				class="rounded-lg px-3 py-1.5 text-sm {getRoleColor(
					user.role
				)} dark:bg-opacity-20 font-medium"
			>
				{user.role === 'super_admin'
					? 'Super Admin'
					: user.role === 'admin'
						? 'Admin'
						: 'User'}
			</span>
		{/if}
	</div>
</div>
