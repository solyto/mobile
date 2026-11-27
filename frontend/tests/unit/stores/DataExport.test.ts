import { describe, it, expect, vi } from 'vitest';
import { DataExport } from '$lib/state/DataExport.svelte';
import type { Auth } from '$lib/state/Auth.svelte';
import type ApiService from '$lib/services/ApiService';
import type { ExportStatus } from '$lib/types/export';

const status: ExportStatus = { id: 7, status: 'completed', created_at: '2026-11-20T10:15:00Z', expires_at: null, is_expired: false };

function exportWith(api: Record<string, unknown>): DataExport {
	return new DataExport({} as Auth, api as unknown as ApiService);
}

describe('DataExport store', () => {
	it('loads the status of the latest export', async () => {
		const getRaw = vi.fn().mockResolvedValue({ success: true, data: status });
		const dataExport = exportWith({ getRaw });

		await dataExport.loadStatus();

		expect(getRaw).toHaveBeenCalledWith(expect.stringMatching(/\/export\/status$/));
		expect(dataExport.status).toEqual(status);
	});

	it('keeps the previous status when loading fails or is not successful', async () => {
		const getRaw = vi.fn().mockResolvedValueOnce({ success: true, data: status }).mockResolvedValueOnce(null).mockResolvedValueOnce({ success: false });
		const dataExport = exportWith({ getRaw });

		await dataExport.loadStatus();
		await dataExport.loadStatus();
		await dataExport.loadStatus();

		expect(dataExport.status).toEqual(status);
	});

	it('starts an export for the given features and returns the answer', async () => {
		const postRaw = vi.fn().mockResolvedValue({ success: true, message: 'Started.' });
		const dataExport = exportWith({ postRaw });

		expect(await dataExport.start(['todos', 'notes'])).toEqual({ success: true, message: 'Started.' });
		expect(postRaw).toHaveBeenCalledWith(expect.stringMatching(/\/export$/), { features: ['todos', 'notes'] });
	});

	it('downloads an export as a zip', async () => {
		const blob = new Blob(['zip']);
		const download = vi.fn().mockResolvedValue(blob);
		const dataExport = exportWith({ download });

		expect(await dataExport.download(status)).toBe(blob);
		expect(download).toHaveBeenCalledWith(expect.stringMatching(/\/export\/7\/download$/), 'application/zip');
	});
});
