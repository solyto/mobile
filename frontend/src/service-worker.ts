/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `aj-cache-${version}`;
// Not needed by most users: cached on first use instead of precached.
// Theme wallpapers and fonts are only used by opt-in themes; the icon sprite only by
// own check-in trackers; the license texts only by the attributions page; .woff is only a
// fallback for browsers without .woff2, which can't run this service worker.
const LAZY = [
	/^\/themes\/.+\.jpg$/,
	/^\/icons\/lucide-sprite\.svg$/,
	/^\/licenses\.txt$/,
	/\/(lora|press-start-2p|cinzel|share-tech-mono)-.+\.woff2$/,
	/\.woff$/
];
const ASSETS = [...build, ...files].filter((path) => !LAZY.some((re) => re.test(path)));

sw.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			await cache.addAll(ASSETS);
			await sw.skipWaiting();
		})()
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys.map((key) => {
					if (key !== CACHE) {
						console.log(`Deleting old cache: ${key}`);
						return caches.delete(key);
					}
				})
			);

			await sw.clients.claim();
		})()
	);
});

sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Only handle same-origin GETs. Cross-origin resources (e.g. the API's
	// /storage images) must go straight to the network: they can never be
	// cached here (opaque responses fail the status-200 guard), and wrapping
	// them in the synthetic offline response below breaks them for the rest of
	// the page load whenever their fetch hits a transient error (e.g. cold
	// browser session).
	if (event.request.method !== 'GET' || url.origin !== sw.location.origin) return;

	if (url.pathname.startsWith('/api')) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			const cachedResponse = await cache.match(event.request);

			if (ASSETS.includes(url.pathname)) {
				return cachedResponse || fetch(event.request);
			}

			if (cachedResponse && LAZY.some((re) => re.test(url.pathname))) return cachedResponse;

			try {
				const networkResponse = await fetch(event.request);
				if (networkResponse && networkResponse.status === 200) {
					await cache.put(event.request, networkResponse.clone());
				}
				return cachedResponse || networkResponse;
			} catch {
				return (
					cachedResponse ||
					new Response('Offline – please check your connection.', {
						status: 503,
						headers: { 'Content-Type': 'text/plain' }
					})
				);
			}
		})()
	);
});

sw.addEventListener('push', (event) => {
	if (!event.data) {
		console.log('Push event received but no data');
		return;
	}

	try {
		const data = event.data.json();

		const options: NotificationOptions = {
			body: data.body || 'You have a new notification',
			icon: data.icon || '/android-chrome-192x192.png',
			badge: data.badge,
			data: data.data || {},
			actions: data.actions || [],
			tag: data.tag || 'default-notification',
			requireInteraction: false,
			vibrate: [200, 100, 200]
		};

		event.waitUntil(sw.registration.showNotification(data.title || 'Notification', options));
	} catch (error) {
		console.error('Error parsing push notification:', error);
		event.waitUntil(
			sw.registration.showNotification('New Notification', {
				body: 'You have a new notification',
				icon: '/android-chrome-192x192.png'
			})
		);
	}
});

sw.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const urlToOpen = event.notification.data?.url || '/';

	event.waitUntil(
		(async () => {
			const windowClients = await sw.clients.matchAll({
				type: 'window',
				includeUncontrolled: true
			});

			for (const client of windowClients) {
				if (client.url === urlToOpen && 'focus' in client) {
					return client.focus();
				}
			}

			if (event.action === 'notification_action' || event.action === 'view_task') {
				return sw.clients.openWindow(urlToOpen);
			}

			if (sw.clients.openWindow) {
				return sw.clients.openWindow(urlToOpen);
			}
		})()
	);
});

sw.addEventListener('notificationclose', (event) => {
	console.log('Notification was closed', event.notification);
});
