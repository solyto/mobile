export function clickOutside(node: HTMLElement, onClick: () => void) {
	const onPointerDown = (e: MouseEvent | TouchEvent) => {
		const target = e.target as Node | null;
		if (target && !node.contains(target)) {
			onClick();
		}
	};

	document.addEventListener('mousedown', onPointerDown, true);
	document.addEventListener('touchstart', onPointerDown, true);

	return {
		destroy() {
			document.removeEventListener('mousedown', onPointerDown, true);
			document.removeEventListener('touchstart', onPointerDown, true);
		}
	};
}
