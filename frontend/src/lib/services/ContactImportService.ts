import type { ImportFileTarget, ImportSource, ImportState } from '$lib/types/contact';

export type ContactImportError = 'invalid_file' | 'address_book_not_found' | 'already_running' | 'rate_limited' | 'generic';

export type ContactImportView = 'start' | 'select' | 'progress' | 'finished' | 'failed';

export default class ContactImportService {
	defaultAddressBookName(fileName: string): string {
		return fileName.replace(/\.(vcf|vcard)$/i, '');
	}

	fileRequest(file: File, target: ImportFileTarget): FormData {
		const body = new FormData();
		body.append('file', file);

		if (target.type === 'new') {
			body.append('name', target.name.trim());
			body.append('color', target.color);
		} else {
			body.append('address_book_id', target.addressBookId.toString());
		}

		return body;
	}

	errorFor(status: number, source: ImportSource): ContactImportError {
		switch (status) {
			case 409:
				return 'already_running';
			case 429:
				return 'rate_limited';
		}

		if (source === 'carddav') return 'generic';

		switch (status) {
			case 413:
			case 422:
				return 'invalid_file';
			case 404:
				return 'address_book_not_found';
			default:
				return 'generic';
		}
	}

	view(state: ImportState | null, awaitingState = false): ContactImportView {
		switch (state?.stage) {
			case 'select':
				return 'select';
			case 'started':
				return awaitingState || state?.source === 'file' ? 'progress' : 'start';
			case 'address-books':
			case 'contacts':
				return 'progress';
			case 'finished':
				return 'finished';
			case 'failed':
				return 'failed';
			default:
				return 'start';
		}
	}

	isRunning(state: ImportState | null, awaitingState = false): boolean {
		return this.view(state, awaitingState) === 'progress';
	}

	isStale(state: ImportState | null): boolean {
		return state?.stage === 'finished' || state?.stage === 'failed';
	}

	progress(state: ImportState): number {
		return state.contacts_count === 0 ? 0 : (state.contacts_done + state.contacts_skipped) / state.contacts_count;
	}

	progressMarker(state: ImportState | null): string {
		if (!state) return '';
		return [state.stage, state.address_books_done, state.contacts_done, state.contacts_skipped].join(':');
	}
}
