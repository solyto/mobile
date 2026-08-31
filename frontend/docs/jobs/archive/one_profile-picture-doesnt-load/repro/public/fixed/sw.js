// Copy of the FIXED service worker fetch handler (TASK-4): only same-origin
// GETs are handled; cross-origin requests (e.g. the api's /storage images)
// go straight to the network, never through the synthetic-503 error path.
const sw = self;
const CACHE = 'repro-fixed';
const ASSETS = [];

sw.addEventListener('install', (event) => event.waitUntil(sw.skipWaiting()));
sw.addEventListener('activate', (event) =>
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(keys.map((key) => key !== CACHE && caches.delete(key)));
			await sw.clients.claim();
		})()
	)
);

async function tell(msg) {
	const cs = await sw.clients.matchAll({ type: 'window' });
	for (const c of cs) c.postMessage({ msg });
}

sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// FIXED: skip everything that is not a same-origin GET
	if (event.request.method !== 'GET' || url.origin !== sw.location.origin) {
		if (event.request.method === 'GET') {
			tell(`skipped cross-origin ${url.origin}${url.pathname} -> direct to network`);
		}
		return;
	}
	if (url.pathname.startsWith('/api')) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			const cachedResponse = await cache.match(event.request);

			if (ASSETS.includes(url.pathname)) {
				return cachedResponse || fetch(event.request);
			}

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
