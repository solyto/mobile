export function downloadBlob(blob: Blob, fileName: string): void {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = fileName;
	a.click();
	// Revoking in the same tick can cancel the download in Safari.
	setTimeout(() => URL.revokeObjectURL(a.href), 0);
}
