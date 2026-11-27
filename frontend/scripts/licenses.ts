import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';
import type { OpenSourceLicense, OpenSourceLicenseWithText } from '../src/lib/types/license';

interface PackageJson {
	name: string;
	version: string;
	license?: string | { type: string };
	licenses?: { type: string }[];
	homepage?: string;
	repository?: string | { url?: string };
	dependencies?: Record<string, string>;
}

const VIRTUAL_ID = 'virtual:licenses';
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID;
export const LICENSE_TEXTS_FILE = 'static/licenses.txt';
const LICENSE_FILE = /^(licen[cs]es?|copying|notice)([-._][\w-]*)?(\.(md|txt|markdown))?$/i;

// SvelteKit lists these as devDependencies, but their code or CSS ends up in the client bundle.
export const BUNDLED_DEV_DEPENDENCIES = [
	'@sveltejs/kit',
	'@tailwindcss/forms',
	'marked',
	'svelte',
	'svelte-awesome-color-picker',
	'tailwindcss'
];

// Third-party code copied into the repo instead of installed, so no package lookup finds it.
export const VENDORED = [
	{ name: '@lucide/svelte', version: '1.59.0', license: 'ISC', url: 'https://lucide.dev', dir: 'src/lib/icons/lucide' }
];

export function resolvePackageDir(name: string, fromDir: string, rootDir: string): string | null {
	let dir = fromDir;
	while (true) {
		const candidate = join(dir, 'node_modules', name);
		if (existsSync(join(candidate, 'package.json'))) return candidate;
		if (dir === rootDir) return null;
		const parent = dirname(dir);
		if (parent === dir) return null;
		dir = parent;
	}
}

export function licenseType(pkg: PackageJson): string {
	if (typeof pkg.license === 'string') return pkg.license;
	if (pkg.license) return pkg.license.type;
	if (pkg.licenses) return pkg.licenses.map((l) => l.type).join(' OR ');
	return 'UNKNOWN';
}

export function projectUrl(pkg: PackageJson): string {
	if (pkg.homepage) return pkg.homepage;

	const repository = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url;
	const repositoryLink = repository ? repositoryUrl(repository) : null;

	return repositoryLink ?? `https://www.npmjs.com/package/${pkg.name}`;
}

// package.json repositories come as "github:owner/repo", "owner/repo", "git+https://….git", "git://…" or "git@host:…".
export function repositoryUrl(repository: string): string | null {
	const shorthand = repository.match(/^(?:github:)?([\w.-]+\/[\w.-]+)$/);
	if (shorthand) return `https://github.com/${shorthand[1]}`;

	const url = repository
		.replace(/^git\+/, '')
		.replace(/^git:\/\//, 'https://')
		.replace(/^git@([^:]+):/, 'https://$1/')
		.replace(/\.git$/, '');

	return /^https?:\/\//.test(url) ? url : null;
}

export function readLicenseText(packageDir: string): string {
	return licenseFiles(packageDir)
		.map((file) => readFileSync(file, 'utf8').trim())
		.join('\n\n');
}

export function collectLicenses(rootDir: string, extraRoots: string[] = []): OpenSourceLicenseWithText[] {
	const rootPkg = readPackageJson(rootDir);
	const queue = [...Object.keys(rootPkg.dependencies ?? {}), ...extraRoots].map((name) => ({ name, fromDir: rootDir }));
	const visited = new Set<string>();
	const licenses = new Map<string, OpenSourceLicenseWithText>();

	while (queue.length > 0) {
		const { name, fromDir } = queue.shift()!;
		const packageDir = resolvePackageDir(name, fromDir, rootDir);
		if (!packageDir || visited.has(packageDir)) continue;
		visited.add(packageDir);

		const pkg = readPackageJson(packageDir);
		licenses.set(`${pkg.name}@${pkg.version}`, {
			name: pkg.name,
			version: pkg.version,
			license: licenseType(pkg),
			url: projectUrl(pkg),
			text: readLicenseText(packageDir)
		});

		for (const dependency of Object.keys(pkg.dependencies ?? {})) {
			queue.push({ name: dependency, fromDir: packageDir });
		}
	}

	return [...licenses.values()].sort(compareLicenses);
}

export function allLicenses(rootDir: string): OpenSourceLicenseWithText[] {
	const vendored = VENDORED.map(({ dir, ...entry }) => ({ ...entry, text: readLicenseText(join(rootDir, dir)) }));

	return [...collectLicenses(rootDir, BUNDLED_DEV_DEPENDENCIES), ...vendored].sort(compareLicenses);
}

export function licenses(rootDir: string = process.cwd()): Plugin {
	return {
		name: 'solyto-licenses',
		resolveId(id) {
			return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : null;
		},
		load(id) {
			if (id !== RESOLVED_VIRTUAL_ID) return null;
			return `export default ${JSON.stringify(credits(allLicenses(rootDir)))};`;
		}
	};
}

export function credits(licenses: OpenSourceLicenseWithText[]): OpenSourceLicense[] {
	return licenses.map(({ name, version, license, url }) => ({ name, version, license, url }));
}

export function licenseTexts(licenses: OpenSourceLicenseWithText[]): string {
	const entries = licenses.map(({ name, version, license, url, text }) =>
		[`${name} ${version} (${license})`, url, '', text || 'The package ships no license file.'].join('\n')
	);

	return ['Open-source licenses of the software solyto uses', ...entries].join('\n\n' + '-'.repeat(80) + '\n\n') + '\n';
}

function compareLicenses(a: OpenSourceLicense, b: OpenSourceLicense): number {
	return a.name.localeCompare(b.name) || a.version.localeCompare(b.version);
}

function readPackageJson(dir: string): PackageJson {
	return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
}

function licenseFiles(dir: string): string[] {
	return readdirSync(dir)
		.filter((entry) => LICENSE_FILE.test(entry))
		.sort()
		.flatMap((entry) => {
			const path = join(dir, entry);
			if (statSync(path).isFile()) return [path];
			return readdirSync(path)
				.sort()
				.map((file) => join(path, file))
				.filter((file) => statSync(file).isFile());
		});
}
