export interface Command {
	id: string;
	title: string;
	subtitle?: string | null;
	category?: string | null;
	icon?: unknown;
	action?: () => void;
	onSelect?: () => void;
	execAfterInput?: (input: string) => void | Promise<void>;
	inputPlaceholder?: string;
}
