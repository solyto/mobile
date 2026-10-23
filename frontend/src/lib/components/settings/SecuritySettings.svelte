<script lang="ts">
	import { onMount } from 'svelte';
	import { startRegistration, type RegistrationResponseJSON } from '@simplewebauthn/browser';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';
	import PasswordSettings from '$lib/components/settings/PasswordSettings.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconButton from '$lib/components/ui/buttons/IconButton.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import type { Passkey } from '$lib/types/auth';
	import IconKey from '@lucide/svelte/icons/key';
	import IconTrash2 from '@lucide/svelte/icons/trash-2';
	import IconCheck from '@lucide/svelte/icons/check';
	import IconPencil from '@lucide/svelte/icons/pencil';
	import IconX from '@lucide/svelte/icons/x';

	const auth = getAuth();
	const ts = getTranslation();
	const notifications = getUiNotifications();

	let passkeys = $state<Passkey[]>([]);
	let loading = $state(false);
	let addingPasskey = $state(false);
	let newPasskeyName = $state('');
	let showNameInput = $state(false);
	let pendingResponse = $state<RegistrationResponseJSON | null>(null);
	let editingId = $state<string | null>(null);
	let editingName = $state('');
	let confirmDeletePasskey = $state<Passkey | null>(null);

	onMount(async () => {
		await loadPasskeys();
	});

	async function loadPasskeys() {
		loading = true;
		try {
			passkeys = await auth.getPasskeys();
		} finally {
			loading = false;
		}
	}

	async function startAddPasskey() {
		addingPasskey = true;
		try {
			const options = await auth.passkeyRegistrationOptions();
			if (!options) throw new Error('No options');
			const response = await startRegistration({ optionsJSON: options });
			pendingResponse = response;
			newPasskeyName = '';
			showNameInput = true;
		} catch {
			notifications.error(ts.get.settings.passkey_add_error);
		} finally {
			addingPasskey = false;
		}
	}

	async function confirmAddPasskey() {
		if (!pendingResponse) return;
		addingPasskey = true;
		showNameInput = false;
		try {
			await auth.passkeyRegister(pendingResponse, newPasskeyName.trim() || 'Passkey');
			notifications.success(ts.get.settings.passkey_added);
			await loadPasskeys();
		} catch {
			notifications.error(ts.get.settings.passkey_add_error);
		} finally {
			addingPasskey = false;
			pendingResponse = null;
			newPasskeyName = '';
		}
	}

	function cancelAddPasskey() {
		showNameInput = false;
		pendingResponse = null;
		newPasskeyName = '';
	}

	function onNameKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') confirmAddPasskey();
		if (event.key === 'Escape') cancelAddPasskey();
	}

	async function deletePasskey() {
		if (!confirmDeletePasskey) return;
		const id = confirmDeletePasskey.id;
		confirmDeletePasskey = null;
		try {
			await auth.deletePasskey(id);
			notifications.success(ts.get.settings.passkey_deleted);
			passkeys = passkeys.filter((p) => p.id !== id);
		} catch {
			notifications.error(ts.get.settings.passkey_delete_error);
		}
	}

	async function saveEdit(id: string) {
		const name = editingName.trim();
		if (!name) return;
		try {
			await auth.renamePasskey(id, name);
			passkeys = passkeys.map((p) => (p.id === id ? { ...p, name } : p));
			editingId = null;
		} catch {
			notifications.error(ts.get.settings.passkey_rename_error);
		}
	}

	function onEditKeyDown(event: KeyboardEvent, id: string) {
		if (event.key === 'Enter') saveEdit(id);
		if (event.key === 'Escape') editingId = null;
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return ts.get.settings.passkey_never_used;
		return auth.getDateInUserPreferredFormat(dateStr);
	}

	function getTransportIcon(transports: string[] | null): string {
		if (!transports || transports.length === 0) return '';
		if (transports.includes('internal')) return '💻';
		if (transports.includes('hybrid')) return '📱';
		if (transports.includes('usb')) return '🔑';
		if (transports.includes('nfc')) return '📡';
		if (transports.includes('ble')) return '🔵';
		return '🔐';
	}
</script>

<div class="flex flex-col gap-8">
<PasswordSettings />
<SettingsSection label={ts.get.settings.passkeys}>
	{#snippet headerAction()}
		{#if !showNameInput}
			<TextButton title={ts.get.settings.passkey_add} onclick={startAddPasskey} disabled={addingPasskey} />
		{/if}
	{/snippet}

	{#if loading}
		<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">Loading...</p>
	{:else if passkeys.length === 0 && !showNameInput}
		<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.settings.passkey_no_passkeys}</p>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each passkeys as passkey (passkey.id)}
				<li class="flex items-center gap-3 rounded-lg border border-c-neutral-2 p-3 dark:border-white/10">
					<span class="text-lg">{getTransportIcon(passkey.transports)}</span>
					<IconKey size={16} class="shrink-0 text-c-neutral-5 dark:text-c-neutral-4" />

					{#if editingId === passkey.id}
						<div class="min-w-0 flex-1">
							<TextInput bind:value={editingName} onkeydown={(e: KeyboardEvent) => onEditKeyDown(e, passkey.id)} />
						</div>
						<div class="flex shrink-0 items-center gap-1">
							<IconButton type="btn" onclick={() => saveEdit(passkey.id)}>
								<IconCheck size={14} />
							</IconButton>
							<IconButton type="slight" onclick={() => (editingId = null)}>
								<IconX size={14} />
							</IconButton>
						</div>
					{:else}
						<div class="flex min-w-0 flex-1 flex-col gap-0.5">
							<span class="truncate text-sm font-medium dark:text-white">{passkey.name}</span>
							<span class="text-xs text-c-neutral-5 dark:text-c-neutral-4">
								{ts.get.settings.passkey_last_used}: {formatDate(passkey.last_used_at)}
							</span>
						</div>
						<div class="flex shrink-0 items-center gap-1">
							<IconButton type="plain" onclick={() => { editingId = passkey.id; editingName = passkey.name; }}>
								<IconPencil size={14} />
							</IconButton>
							<IconButton type="danger" onclick={() => (confirmDeletePasskey = passkey)}>
								<IconTrash2 size={14} />
							</IconButton>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if showNameInput}
		<div class="mt-4 flex items-center gap-2">
			<div class="flex-1">
				<TextInput
					bind:value={newPasskeyName}
					placeholder={ts.get.settings.passkey_name_placeholder}
					onkeydown={onNameKeyDown}
				/>
			</div>
			<IconButton type="btn" onclick={confirmAddPasskey}>
				<IconCheck size={14} />
			</IconButton>
			<IconButton type="slight" onclick={cancelAddPasskey}>
				<IconX size={14} />
			</IconButton>
		</div>
	{/if}
</SettingsSection>
</div>

{#if confirmDeletePasskey}
	<ConfirmationModal
		type="confirm-delete"
		description={ts.get.settings.passkey_delete_confirm}
		onConfirm={deletePasskey}
		onCancel={() => { confirmDeletePasskey = null; }}
	/>
{/if}
