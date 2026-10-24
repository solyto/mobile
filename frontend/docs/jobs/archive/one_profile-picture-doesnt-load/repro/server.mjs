// Repro harness for solyto job "one_profile-picture-doesnt-load"
//
// Two origins, like production (app.solyto.app -> api.solyto.app):
//   http://127.0.0.1:8199  — "app" origin: pages + their scoped service workers
//   http://127.0.0.1:8299  — "api" origin: /storage/user/pic.png
//
// The api origin simulates a cold-start transient network failure: the FIRST
// /storage/user/pic.png request after each /ping is destroyed at the socket
// level (so fetch() rejects, exactly like a fresh browser session racing DNS /
// TLS), subsequent requests succeed with a real PNG.
import http from 'node:http';
import zlib from 'node:zlib';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_PORT = 8199;
const API_PORT = 8299;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), 'public');

// ---------- tiny PNG encoder (solid color, no deps) ----------
function crc32(buf) {
	let c, crc = 0xffffffff;
	for (let n = 0; n < buf.length; n++) {
		c = (crc ^ buf[n]) & 0xff;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		crc = (crc >>> 8) ^ c;
	}
	return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length);
	const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(body));
	return Buffer.concat([len, body, crc]);
}
function solidPng(size, [r, g, b]) {
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(size, 0);
	ihdr.writeUInt32BE(size, 4);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 2; // color type RGB
	const raw = Buffer.alloc(size * (1 + size * 3));
	for (let y = 0; y < size; y++) {
		const row = y * (1 + size * 3);
		raw[row] = 0; // filter none
		for (let x = 0; x < size; x++) {
			const p = row + 1 + x * 3;
			raw[p] = r; raw[p + 1] = g; raw[p + 2] = b;
		}
	}
	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk('IHDR', ihdr),
		chunk('IDAT', zlib.deflateSync(raw)),
		chunk('IEND', Buffer.alloc(0))
	]);
}
const API_PNG = solidPng(32, [46, 204, 113]);   // green  = api storage image
const OK_PNG = solidPng(32, [52, 152, 219]);    // blue   = same-origin control

// ---------- app origin: static files ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png' };
http.createServer((req, res) => {
	if (req.url.split('?')[0] === '/ok.png') {
		res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' }).end(OK_PNG);
		return;
	}
	let path = req.url.split('?')[0];
	if (path.endsWith('/')) path += 'index.html';
	const file = join(ROOT, path);
	if (!file.startsWith(ROOT) || !existsSync(file)) {
		res.writeHead(404).end('not found');
		return;
	}
	res.writeHead(200, {
		'Content-Type': MIME[file.slice(file.lastIndexOf('.'))] ?? 'application/octet-stream',
		'Cache-Control': 'no-store',
		'Service-Worker-Allowed': '/'
	}).end(readFileSync(file));
}).listen(APP_PORT, '127.0.0.1', () => console.log(`app  origin: http://127.0.0.1:${APP_PORT}/prod/ and /fixed/`));

// ---------- api origin: stateful storage image ----------
let failNext = true; // first request after server start also simulates cold start
http.createServer((req, res) => {
	if (req.url.startsWith('/ping')) {
		failNext = true;
		console.log(`[api] /ping -> re-arm: next storage request will be destroyed at socket level`);
		res.writeHead(204, { 'Cache-Control': 'no-store' }).end();
		return;
	}
	if (req.url.startsWith('/storage/user/')) {
		if (failNext) {
			failNext = false;
			console.log(`[api] ${req.url} -> DESTROYING SOCKET (simulated cold-start transient failure)`);
			res.socket.destroy();
			return;
		}
		console.log(`[api] ${req.url} -> 200 PNG`);
		res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' }).end(API_PNG);
		return;
	}
	res.writeHead(404).end();
}).listen(API_PORT, '127.0.0.1', () => console.log(`api  origin: http://127.0.0.1:${API_PORT}/storage/user/pic.png`));
