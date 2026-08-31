// Instrumented copy of src/service-worker.ts (production fetch handler, logic
// verbatim — only the postMessage `tell()` logging lines were added, and the
// precache ASSETS list emptied since app-shell precaching is irrelevant here).
// SWR + synthetic-503 catch are exactly what ships today.
const sw = self;
const CACHE = 'repro-prod';
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

	if (event.request.method !== 'GET' || url.pathname.startsWith('/api')) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			const cachedResponse = await cache.match(event.request);

			if (ASSETS.includes(url.pathname)) {
				return cachedResponse || fetch(event.request);
			}

			try {
				if (url.origin !== sw.location.origin) {
					await tell(`intercepted CROSS-ORIGIN ${url.origin}${url.pathname} (only /api is skipped) -> SWR branch`);
				}
				const networkResponse = await fetch(event.request);
				if (url.origin !== sw.location.origin) {
					await tell(`network fetch resolved (type=${networkResponse.type}, status=${networkResponse.status}) -> returning it`);
				}
				if (networkResponse && networkResponse.status === 200) {
					await cache.put(event.request, networkResponse.clone());
				}
				return cachedResponse || networkResponse;
			} catch (err) {
				await tell(`network fetch REJECTED (${err.name}) -> returning synthetic 503 text/plain`);
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
