export const SHEET_TAP_TOLERANCE = 6;
export const SHEET_RELEASE_PAUSE = 100;
export const SHEET_CLOSE_DISTANCE_RATIO = 0.25;
export const SHEET_CLOSE_VELOCITY = 0.5;
export const SHEET_FLICK_MIN_DISTANCE = 20;

export function getSheetDragOffset(startY: number, currentY: number): number {
	return Math.max(0, currentY - startY);
}

export function shouldCloseSheet(offset: number, sheetHeight: number, velocity: number): boolean {
	if (offset >= sheetHeight * SHEET_CLOSE_DISTANCE_RATIO) return true;
	return offset >= SHEET_FLICK_MIN_DISTANCE && velocity >= SHEET_CLOSE_VELOCITY;
}
