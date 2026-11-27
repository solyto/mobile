<script lang="ts">
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { onMount } from 'svelte';
	import { getPushNotifications } from '$lib/state/PushNotifications.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const ts = getTranslation();
	const pushNotifications = getPushNotifications();
	const notifications = getUiNotifications();

	let checked = $state<boolean>(false);
	let isLoading = $state<boolean>(false);

	onMount(async () => {
		if (pushNotifications.isNative()) {
			checked = await pushNotifications.nativeStatus().then((status) => status.enabled, () => false);
			return;
		}

		await pushNotifications.loadVapidKey();

		await checkPushSubscription();
	});

	async function checkPushSubscription() {
		try {
			if (Notification.permission !== 'granted') {
				checked = false;
				return;
			}

			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.getSubscription();
			checked = sub !== null;
		} catch (error) {
			console.error('Failed to check subscription:', error);
			checked = false;
		}
	}

	async function togglePushNotifications(wanted: boolean) {
		if (isLoading) {
			checked = !wanted;
			return;
		}

		isLoading = true;

		try {
			if (pushNotifications.isNative()) {
				await toggleNativePush(wanted);
			} else if (wanted) {
				checked = await subscribeToPush();
			} else {
				await unsubscribeFromPush();
				checked = false;
			}
		} catch (error) {
			checked = !wanted;
			console.error('Push notification error:', error);
			notifications.error(ts.get.settings.push_notification_error);
		} finally {
			isLoading = false;
		}
	}

	async function toggleNativePush(enabled: boolean) {
		const status = await pushNotifications.setNative(enabled);
		checked = status.enabled;

		if (enabled && status.permission === 'denied') {
			notifications.error(ts.get.settings.notification_permission_denied);
		}
	}

	async function subscribeToPush(): Promise<boolean> {
		const permission = await Notification.requestPermission();

		if (permission !== 'granted') {
			notifications.error(ts.get.settings.notification_permission_denied);
			return false;
		}

		if (!pushNotifications.vapidPublicKey) {
			throw new Error('VAPID public key not loaded');
		}

		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(pushNotifications.vapidPublicKey)
		});

		const registered = await pushNotifications.subscribe(sub.toJSON());

		if (!registered) {
			throw new Error('Failed to register subscription on server');
		}

		return true;
	}

	async function unsubscribeFromPush() {
		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.getSubscription();

		if (sub) {
			await sub.unsubscribe();

			await pushNotifications.unsubscribe(sub.endpoint);
		}
	}

	function urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}
</script>

<div>
	<Toggle
		label={ts.get.settings.enable_push_notifications}
		bind:checked
		onchange={togglePushNotifications}
	/>
</div>
