// Builds the data behind custom tracker icons from our Lucide copy:
//   static/icons/lucide-sprite.svg               every icon's drawing as a <symbol>, so hand-replaced drawings show up
//   src/lib/icons/lucide/picker-data.json        Lucide's categories and search terms, for the icon picker
//
//   node scripts/lucide-picker-data.ts                      after changing or adding an icon
//   node scripts/lucide-picker-data.ts <lucide-repo-dir>    to take categories and terms from a
//                                                           Lucide checkout (icons/*.json, categories/*.json)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type IconNode = [string, Record<string, string | number>][];

interface PickerIcon {
	categories: string[];
	tags: string[];
}

interface PickerData {
	lucideVersion: string;
	categories: string[];
	icons: Record<string, PickerIcon>;
}

const ICONS_DIR = join(process.cwd(), 'src/lib/icons/lucide');
const PICKER_DATA = join(ICONS_DIR, 'picker-data.json');
const SPRITE_DIR = join(process.cwd(), 'static/icons');
const SPRITE = join(SPRITE_DIR, 'lucide-sprite.svg');
const LUCIDE_VERSION = '1.59.0';

function readNode(file: string): IconNode {
	const source = readFileSync(file, 'utf8');
	const start = source.indexOf('node: [');
	if (start === -1) throw new Error(`No icon drawing found in ${file}`);

	let depth = 0;
	let end = start + 'node: '.length;
	for (; end < source.length; end++) {
		if (source[end] === '[') depth++;
		if (source[end] === ']' && --depth === 0) break;
	}

	const literal = source.slice(start + 'node: '.length, end + 1);
	const json = literal.replace(/([{,]\s*)([a-zA-Z][\w-]*):/g, '$1"$2":').replace(/'/g, '"');

	return JSON.parse(json) as IconNode;
}

function escapeAttribute(value: string | number): string {
	return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function symbol(name: string, node: IconNode): string {
	const children = node
		.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([key, value]) => `${key}="${escapeAttribute(value)}"`).join(' ')}/>`)
		.join('');

	return `<symbol id="${name}" viewBox="0 0 24 24">${children}</symbol>`;
}

function readLucideMetadata(repoDir: string): { categories: string[]; icons: Record<string, PickerIcon> } {
	const categories = readdirSync(join(repoDir, 'categories'))
		.filter((file) => file.endsWith('.json'))
		.map((file) => file.slice(0, -'.json'.length))
		.sort();

	const icons: Record<string, PickerIcon> = {};
	for (const file of readdirSync(join(repoDir, 'icons')).filter((f) => f.endsWith('.json'))) {
		const data = JSON.parse(readFileSync(join(repoDir, 'icons', file), 'utf8'));
		icons[file.slice(0, -'.json'.length)] = { categories: data.categories ?? [], tags: data.tags ?? [] };
	}

	return { categories, icons };
}

function readExistingMetadata(): { categories: string[]; icons: Record<string, PickerIcon> } {
	if (!existsSync(PICKER_DATA)) throw new Error('No picker-data.json yet: pass a Lucide checkout to take categories and terms from.');

	const existing = JSON.parse(readFileSync(PICKER_DATA, 'utf8')) as PickerData;
	return { categories: existing.categories, icons: existing.icons };
}

const repoDir = process.argv[2];
const metadata = repoDir ? readLucideMetadata(repoDir) : readExistingMetadata();

const icons: Record<string, PickerIcon> = {};
const symbols: string[] = [];
for (const file of readdirSync(ICONS_DIR).sort()) {
	if (!file.endsWith('.svelte') || file === 'Icon.svelte') continue;

	const name = file.slice(0, -'.svelte'.length);
	icons[name] = { categories: metadata.icons[name]?.categories ?? [], tags: metadata.icons[name]?.tags ?? [] };
	symbols.push(symbol(name, readNode(join(ICONS_DIR, file))));
}

const data: PickerData = { lucideVersion: LUCIDE_VERSION, categories: metadata.categories, icons };
writeFileSync(PICKER_DATA, JSON.stringify(data) + '\n');

mkdirSync(SPRITE_DIR, { recursive: true });
writeFileSync(
	SPRITE,
	`<svg xmlns="http://www.w3.org/2000/svg"><!-- Lucide ${LUCIDE_VERSION}, ISC (see src/lib/icons/lucide/LICENSE) -->${symbols.join('')}</svg>\n`
);

console.log(`Wrote ${symbols.length} icons in ${metadata.categories.length} categories`);
