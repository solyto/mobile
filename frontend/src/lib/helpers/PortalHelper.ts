export type PortalActionOptions = {
	target?: HTMLElement | null;
	closeOnScroll?: boolean;
	onClose?: () => void;
};

export function portalToBody(
	node: HTMLElement,
	{ target = null, closeOnScroll = false, onClose }: PortalActionOptions = {}
): { destroy: () => void } {
	const anchor = target ?? node;
	const rect = anchor.getBoundingClientRect();

	node.style.position = 'fixed';
	node.style.top = rect.top + 'px';
	node.style.left = rect.left + 'px';
	node.style.zIndex = '60';

	document.body.appendChild(node);

	if (closeOnScroll && onClose) {
		window.addEventListener('scroll', onClose, true);
	}

	return {
		destroy() {
			if (closeOnScroll && onClose) {
				window.removeEventListener('scroll', onClose, true);
			}
			if (node.isConnected) node.remove();
		}
	};
}