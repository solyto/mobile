<script lang="ts">
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { onMount } from 'svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import ApiService from '$lib/services/ApiService';
	import { apiRoutes } from '$lib/config/apiRoutes';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const ts = getTranslation();
	const auth = getAuth();
	const notifications = getUiNotifications();
	const apiService = new ApiService(auth.getToken());

	let checked = $state<boolean>(false);
	let isLoading = $state<boolean>(false);
	let vapidPublicKey = $state<string>('');

	onMount(async () => {
		const res = await apiService.get(apiRoutes.notifications.push.getVapidKey, null);
		if (res?.data) vapidPublicKey = (res.data as { public_key: string }).public_key;

		await checkPushSubscription();
	});

	async function checkPushSubscription() {
		try {
			// Only check subscription if we have permission
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

	async function togglePushNotifications() {
		if (isLoading) return;

		const newState = !checked;
		isLoading = true;

		try {
			if (newState) {
				await subscribeToPush();
				checked = true;
			} else {
				await unsubscribeFromPush();
				checked = false;
			}
		} catch (error) {
			console.error('Push notification error:', error);
			notifications.error(ts.get.settings.push_notification_error);
			// checked stays at its original value
		} finally {
			isLoading = false;
		}
	}

	async function subscribeToPush() {
		const permission = await Notification.requestPermission();

		if (permission !== 'granted') {
			checked = false;
			notifications.error(ts.get.settings.notification_permission_denied);
			return;
		}

		if (!vapidPublicKey) {
			throw new Error('VAPID public key not loaded');
		}

		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
		});

		// Convert subscription to JSON format that matches Laravel expectations
		const subscriptionData = sub.toJSON();

		// Send subscription to backend
		const res = await apiService.create(
			apiRoutes.notifications.push.subscribe,
			subscriptionData
		);

		if (!res) {
			throw new Error('Failed to register subscription on server');
		}
	}

	async function unsubscribeFromPush() {
		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.getSubscription();

		if (sub) {
			await sub.unsubscribe();

			// Send endpoint to backend for deletion
			await apiService.create(apiRoutes.notifications.push.unsubscribe, {
				endpoint: sub.endpoint
			});
		}
	}

	// Helper function to convert VAPID key
	function urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

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
		{checked}
		onchange={togglePushNotifications}
	/>
</div>
