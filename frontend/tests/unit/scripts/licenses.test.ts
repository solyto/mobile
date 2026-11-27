import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	allLicenses,
	collectLicenses,
	credits,
	LICENSE_TEXTS_FILE,
	licenseTexts,
	licenseType,
	projectUrl,
	readLicenseText,
	repositoryUrl,
	resolvePackageDir
} from '../../../scripts/licenses';

let root: string;

function writePackage(dir: string, pkg: Record<string, unknown>, files: Record<string, string> = {}): void {
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg));
	for (const [name, content] of Object.entries(files)) {
		mkdirSync(join(dir, name, '..'), { recursive: true });
		writeFileSync(join(dir, name), content);
	}
}

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), 'licenses-'));
});

afterEach(() => {
	rmSync(root, { recursive: true, force: true });
});

describe('resolvePackageDir', () => {
	it('prefers a nested node_modules over the hoisted one', () => {
		const parent = join(root, 'node_modules', 'parent');
		writePackage(join(root, 'node_modules', 'child'), { name: 'child', version: '1.0.0' });
		writePackage(join(parent, 'node_modules', 'child'), { name: 'child', version: '2.0.0' });
		expect(resolvePackageDir('child', parent, root)).toBe(join(parent, 'node_modules', 'child'));
	});

	it('walks up to the hoisted package and resolves scoped names', () => {
		const parent = join(root, 'node_modules', 'parent');
		writePackage(parent, { name: 'parent', version: '1.0.0' });
		writePackage(join(root, 'node_modules', '@scope', 'child'), { name: '@scope/child', version: '1.0.0' });
		expect(resolvePackageDir('@scope/child', parent, root)).toBe(join(root, 'node_modules', '@scope', 'child'));
	});

	it('returns null for a package that is not installed', () => {
		expect(resolvePackageDir('missing', root, root)).toBeNull();
	});
});

describe('licenseType', () => {
	it('reads the string, object and legacy array forms', () => {
		expect(licenseType({ name: 'a', version: '1', license: 'MIT' })).toBe('MIT');
		expect(licenseType({ name: 'a', version: '1', license: { type: 'ISC' } })).toBe('ISC');
		expect(licenseType({ name: 'a', version: '1', licenses: [{ type: 'MIT' }, { type: 'GPL-2.0' }] })).toBe('MIT OR GPL-2.0');
		expect(licenseType({ name: 'a', version: '1' })).toBe('UNKNOWN');
	});
});

describe('readLicenseText', () => {
	it('joins license, notice and licenses-folder files and ignores code files', () => {
		const dir = join(root, 'pkg');
		writePackage(dir, { name: 'pkg', version: '1.0.0' }, {
			'LICENSE.md': 'main license\n',
			NOTICE: 'notice',
			'licenses/LICENSE-d3': 'd3 license',
			'license-checker.js': 'code',
			'index.js': 'code'
		});
		expect(readLicenseText(dir)).toBe('main license\n\nnotice\n\nd3 license');
	});

	it('is empty when the package ships no license file', () => {
		const dir = join(root, 'pkg');
		writePackage(dir, { name: 'pkg', version: '1.0.0' });
		expect(readLicenseText(dir)).toBe('');
	});
});

describe('collectLicenses', () => {
	beforeEach(() => {
		writePackage(root, {
			name: 'app',
			version: '0.0.1',
			dependencies: { zeta: '1', alpha: '1' },
			devDependencies: { tool: '1', bundled: '1' }
		});
		writePackage(join(root, 'node_modules', 'zeta'), { name: 'zeta', version: '1.0.0', license: 'MIT', dependencies: { shared: '1' } }, { LICENSE: 'zeta text' });
		writePackage(join(root, 'node_modules', 'alpha'), { name: 'alpha', version: '1.0.0', license: 'ISC', dependencies: { shared: '1' } });
		writePackage(join(root, 'node_modules', 'alpha', 'node_modules', 'shared'), { name: 'shared', version: '2.0.0', license: 'MIT' });
		writePackage(join(root, 'node_modules', 'shared'), { name: 'shared', version: '1.0.0', license: 'MIT' });
		writePackage(join(root, 'node_modules', 'tool'), { name: 'tool', version: '1.0.0', license: 'MIT' });
		writePackage(join(root, 'node_modules', 'bundled'), { name: 'bundled', version: '1.0.0', license: 'MIT' });
	});

	it('lists production dependencies and their transitive dependencies, sorted, one entry per version', () => {
		expect(collectLicenses(root).map((l) => `${l.name}@${l.version}`)).toEqual([
			'alpha@1.0.0',
			'shared@1.0.0',
			'shared@2.0.0',
			'zeta@1.0.0'
		]);
	});

	it('adds the extra roots but no other devDependencies', () => {
		const names = collectLicenses(root, ['bundled']).map((l) => l.name);
		expect(names).toContain('bundled');
		expect(names).not.toContain('tool');
	});

	it('returns name, version, license, link and text per package', () => {
		expect(collectLicenses(root).find((l) => l.name === 'zeta')).toEqual({
			name: 'zeta',
			version: '1.0.0',
			license: 'MIT',
			url: 'https://www.npmjs.com/package/zeta',
			text: 'zeta text'
		});
	});
});

describe('projectUrl', () => {
	it('prefers the homepage, then the repository, then the npm page', () => {
		const repository = 'git+https://github.com/owner/repo.git';

		expect(projectUrl({ name: 'a', version: '1', homepage: 'https://a.dev', repository })).toBe('https://a.dev');
		expect(projectUrl({ name: 'a', version: '1', repository: { url: repository } })).toBe('https://github.com/owner/repo');
		expect(projectUrl({ name: '@scope/a', version: '1' })).toBe('https://www.npmjs.com/package/@scope/a');
	});

	it('falls back to the npm page for a repository that is no web address', () => {
		expect(projectUrl({ name: 'a', version: '1', repository: 'svn://example.com/a' })).toBe('https://www.npmjs.com/package/a');
	});
});

describe('repositoryUrl', () => {
	it.each([
		['github:owner/repo', 'https://github.com/owner/repo'],
		['owner/repo', 'https://github.com/owner/repo'],
		['git+https://github.com/owner/repo.git', 'https://github.com/owner/repo'],
		['git://github.com/owner/repo.git', 'https://github.com/owner/repo'],
		['git@github.com:owner/repo.git', 'https://github.com/owner/repo'],
		['https://gitlab.com/owner/repo', 'https://gitlab.com/owner/repo']
	])('turns %s into a web address', (repository, url) => {
		expect(repositoryUrl(repository)).toBe(url);
	});
});

describe('credits and licenseTexts', () => {
	const entries = [
		{ name: 'alpha', version: '1.0.0', license: 'MIT', url: 'https://alpha.dev', text: 'alpha text' },
		{ name: 'beta', version: '2.0.0', license: 'ISC', url: 'https://beta.dev', text: '' }
	];

	it('leaves the texts out of the credits', () => {
		expect(credits(entries)).toEqual([
			{ name: 'alpha', version: '1.0.0', license: 'MIT', url: 'https://alpha.dev' },
			{ name: 'beta', version: '2.0.0', license: 'ISC', url: 'https://beta.dev' }
		]);
	});

	it('lists every package with its link and text, and says so when a package has no text', () => {
		const text = licenseTexts(entries);

		expect(text).toContain('alpha 1.0.0 (MIT)\nhttps://alpha.dev\n\nalpha text');
		expect(text).toContain('beta 2.0.0 (ISC)\nhttps://beta.dev\n\nThe package ships no license file.');
	});
});

describe('static/licenses.txt', () => {
	it('is up to date with the installed packages (else run npm run licenses)', () => {
		expect(readFileSync(join(process.cwd(), LICENSE_TEXTS_FILE), 'utf8')).toBe(licenseTexts(allLicenses(process.cwd())));
	});
});

describe('allLicenses on this repository', () => {
	it('includes the bundled packages and the icons', () => {
		const names = allLicenses(process.cwd()).map((l) => l.name);
		for (const name of ['svelte', '@lucide/svelte', '@tiptap/core', 'prosemirror-model', 'echarts', 'zrender', 'dompurify']) {
			expect(names).toContain(name);
		}
	});

	it('takes the icons licence from the copy in the repo, including the Feather MIT part', () => {
		const lucide = allLicenses(process.cwd()).find((l) => l.name === '@lucide/svelte');

		expect(lucide).toMatchObject({ version: '1.59.0', license: 'ISC' });
		expect(lucide?.text).toContain('ISC License');
		expect(lucide?.text).toContain('Copyright (c) 2013-present Cole Bemis');
	});
});
