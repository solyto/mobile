import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import type { ExportStartResponse, ExportStatus } from '$lib/types/export';

export class DataExport {
	status = $state<ExportStatus | null>(null);
	auth: Auth;
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async loadStatus(): Promise<void> {
		const res = await this.apiService.getRaw<{ success: boolean; data: ExportStatus }>(apiRoutes.export.status);
		if (res?.success) this.status = res.data;
	}

	start(features: string[]): Promise<ExportStartResponse> {
		return this.apiService.postRaw<ExportStartResponse>(apiRoutes.export.start, { features });
	}

	download(status: ExportStatus): Promise<Blob | null> {
		return this.apiService.download(apiRoutes.export.download.replace('%s', String(status.id)), 'application/zip');
	}
}

const DATA_EXPORT_KEY = Symbol('SOLYTO_DATA_EXPORT');

export function setDataExport(): DataExport {
	return setContext(DATA_EXPORT_KEY, new DataExport());
}

export function getDataExport(): DataExport {
	return getContext<DataExport>(DATA_EXPORT_KEY);
}
