export type MenuIcon = 'new' | 'new-folder' | 'new-file' | 'edit' | 'move' | 'delete';

export interface RightClickMenuEntry {
	icon: MenuIcon;
	label: string;
	action: () => void;
}
