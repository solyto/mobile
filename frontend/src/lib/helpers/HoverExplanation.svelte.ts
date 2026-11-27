export class HoverExplanation {
	visible = $state<boolean>(false);
	x = $state<number>(0);
	y = $state<number>(0);

	readonly handlers = {
		onmouseover: () => this.show(),
		onmouseout: () => this.hide(),
		onfocus: () => this.show(),
		onblur: () => this.hide(),
		onmousemove: (event: MouseEvent) => this.moveTo(event)
	};

	show(): void {
		this.visible = true;
	}

	hide(): void {
		this.visible = false;
	}

	moveTo(event: MouseEvent): void {
		this.x = event.clientX;
		this.y = event.clientY;
	}
}
