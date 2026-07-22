import type { FeatureConfig } from '$lib/types/feature';
import { PLATFORM } from '$lib/config/platform';
import LocalStorageService from '$lib/services/LocalStorageService';

const LS_FIRST_STARTUP_KEY = 'first_startup';
const ls = new LocalStorageService();

const isWeb = PLATFORM === 'web';
const firstStartup = !isWeb && !ls.getBool(LS_FIRST_STARTUP_KEY);
if (firstStartup) ls.setBool(LS_FIRST_STARTUP_KEY, true);

export const featureConfig: FeatureConfig = {
	setCustomApiUrl: !isWeb,
	firstStartupOptions: firstStartup
};