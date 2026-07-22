/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Type-safe SvelteKit SW environment
const sw = self as unknown as ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `aj-cache-${version}`;
const ASSETS = [...build, ...files];

// 🧱 INSTALL: Precache app shell (static assets)
sw.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			await cache.addAll(ASSETS);
			await sw.skipWaiting(); // activate immediately
		})()
	);
});

// 🧹 ACTIVATE: Remove old caches
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

// ⚡ FETCH: Cache-first for app shell, stale-while-revalidate for everything else
sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Skip non-GET and API calls
	if (event.request.method !== 'GET' || url.pathname.startsWith('/api')) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			const cachedResponse = await cache.match(event.request);

			// Cache-first for static app assets
			if (ASSETS.includes(url.pathname)) {
				return cachedResponse || fetch(event.request);
			}

			// Stale-while-revalidate for everything else
			try {
				const networkResponse = await fetch(event.request);
				if (networkResponse && networkResponse.status === 200) {
					await cache.put(event.request, networkResponse.clone());
				}
				return cachedResponse || networkResponse;
			} catch {
				// Always return a Response object
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
			icon: data.icon || '/icon.png',
			badge: data.badge || '/badge.png',
			data: data.data || {},
			actions: data.actions || [],
			tag: data.tag || 'default-notification',
			requireInteraction: false,
			vibrate: [200, 100, 200]
		};

		event.waitUntil(sw.registration.showNotification(data.title || 'Notification', options));
	} catch (error) {
		console.error('Error parsing push notification:', error);
		// Fallback notification if parsing fails
		event.waitUntil(
			sw.registration.showNotification('New Notification', {
				body: 'You have a new notification',
				icon: '/icon.png'
			})
		);
	}
});

sw.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const urlToOpen = event.notification.data?.url || '/';

	event.waitUntil(
		(async () => {
			// Check if there's already a window open
			const windowClients = await sw.clients.matchAll({
				type: 'window',
				includeUncontrolled: true
			});

			// If a window is already open, focus it and navigate
			for (const client of windowClients) {
				if (client.url === urlToOpen && 'focus' in client) {
					return client.focus();
				}
			}

			// If action button was clicked
			if (event.action === 'notification_action' || event.action === 'view_task') {
				return sw.clients.openWindow(urlToOpen);
			}

			// Default click behavior - open or focus window
			if (sw.clients.openWindow) {
				return sw.clients.openWindow(urlToOpen);
			}
		})()
	);
});

sw.addEventListener('notificationclose', (event) => {
	console.log('Notification was closed', event.notification);
	// You could send analytics here if needed
});
