// Writes static/licenses.txt, the full license texts linked from the attributions page.
//
//   npm run licenses        after adding, removing or updating a dependency
import { writeFileSync } from 'node:fs';
import { allLicenses, LICENSE_TEXTS_FILE, licenseTexts } from './licenses.ts';

writeFileSync(LICENSE_TEXTS_FILE, licenseTexts(allLicenses(process.cwd())));
