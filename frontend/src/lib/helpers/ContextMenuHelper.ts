const LONG_PRESS_DELAY = 500;
const LONG_PRESS_TOLERANCE = 10;

type OpenContextMenu = (x: number, y: number) => void;

export function contextMenu(node: HTMLElement, open: OpenContextMenu) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let startX = 0;
	let startY = 0;
	let longPressed = false;

	// iOS fires no contextmenu event on long-press and shows its own link preview instead.
	node.style.setProperty('-webkit-touch-callout', 'none');
	node.style.userSelect = 'none';

	function cancelLongPress(): void {
		clearTimeout(timer);
	}

	function onContextMenu(event: MouseEvent): void {
		event.preventDefault();
		cancelLongPress();
		open(event.clientX, event.clientY);
	}

	function onPointerDown(event: PointerEvent): void {
		longPressed = false;
		if (event.pointerType !== 'touch') return;

		startX = event.clientX;
		startY = event.clientY;
		timer = setTimeout(() => {
			longPressed = true;
			open(startX, startY);
		}, LONG_PRESS_DELAY);
	}

	function onPointerMove(event: PointerEvent): void {
		if (Math.abs(event.clientX - startX) > LONG_PRESS_TOLERANCE || Math.abs(event.clientY - startY) > LONG_PRESS_TOLERANCE) {
			cancelLongPress();
		}
	}

	function onClick(event: MouseEvent): void {
		if (!longPressed) return;

		event.preventDefault();
		event.stopImmediatePropagation();
		longPressed = false;
	}

	node.addEventListener('contextmenu', onContextMenu);
	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerup', cancelLongPress);
	node.addEventListener('pointercancel', cancelLongPress);
	node.addEventListener('click', onClick, true);

	return {
		update(newOpen: OpenContextMenu) {
			open = newOpen;
		},
		destroy() {
			cancelLongPress();
			node.removeEventListener('contextmenu', onContextMenu);
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', cancelLongPress);
			node.removeEventListener('pointercancel', cancelLongPress);
			node.removeEventListener('click', onClick, true);
		}
	};
}
