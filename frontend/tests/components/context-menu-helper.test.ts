import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { contextMenu } from '$lib/helpers/ContextMenuHelper';

function pointer(type: string, pointerType: string, x: number, y: number): MouseEvent {
	const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y });
	Object.defineProperty(event, 'pointerType', { value: pointerType });
	return event;
}

let node: HTMLElement;
let open: ReturnType<typeof vi.fn<(x: number, y: number) => void>>;
let action: ReturnType<typeof contextMenu>;

beforeEach(() => {
	vi.useFakeTimers();
	node = document.createElement('a');
	document.body.appendChild(node);
	open = vi.fn<(x: number, y: number) => void>();
	action = contextMenu(node, open);
});

afterEach(() => {
	action.destroy();
	node.remove();
	vi.useRealTimers();
});

describe('contextMenu', () => {
	it('opens on right-click at the cursor and suppresses the browser menu', () => {
		const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 20 });
		node.dispatchEvent(event);

		expect(open).toHaveBeenCalledWith(10, 20);
		expect(event.defaultPrevented).toBe(true);
	});

	it('opens on a touch long-press at the touch point', () => {
		node.dispatchEvent(pointer('pointerdown', 'touch', 30, 40));
		vi.advanceTimersByTime(500);

		expect(open).toHaveBeenCalledWith(30, 40);
	});

	it('does not open when the touch is released early', () => {
		node.dispatchEvent(pointer('pointerdown', 'touch', 30, 40));
		node.dispatchEvent(pointer('pointerup', 'touch', 30, 40));
		vi.advanceTimersByTime(500);

		expect(open).not.toHaveBeenCalled();
	});

	it('does not open when the finger moves, e.g. to scroll', () => {
		node.dispatchEvent(pointer('pointerdown', 'touch', 30, 40));
		node.dispatchEvent(pointer('pointermove', 'touch', 30, 80));
		vi.advanceTimersByTime(500);

		expect(open).not.toHaveBeenCalled();
	});

	it('ignores a long mouse press', () => {
		node.dispatchEvent(pointer('pointerdown', 'mouse', 30, 40));
		vi.advanceTimersByTime(500);

		expect(open).not.toHaveBeenCalled();
	});

	it('swallows the click that follows a long-press', () => {
		const onClick = vi.fn();
		node.addEventListener('click', onClick);
		node.dispatchEvent(pointer('pointerdown', 'touch', 30, 40));
		vi.advanceTimersByTime(500);

		const label = document.createElement('span');
		node.appendChild(label);
		const click = new MouseEvent('click', { bubbles: true, cancelable: true });
		label.dispatchEvent(click);

		expect(click.defaultPrevented).toBe(true);
		expect(onClick).not.toHaveBeenCalled();
	});

	it('lets a normal tap through', () => {
		const onClick = vi.fn();
		node.addEventListener('click', onClick);
		node.dispatchEvent(pointer('pointerdown', 'touch', 30, 40));
		node.dispatchEvent(pointer('pointerup', 'touch', 30, 40));
		node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(onClick).toHaveBeenCalledOnce();
	});

	it('uses the latest callback after an update', () => {
		const next = vi.fn();
		action.update(next);
		node.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 1, clientY: 2 }));

		expect(open).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith(1, 2);
	});
});
