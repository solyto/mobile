export type MenuIcon = 'new' | 'new-folder' | 'new-file' | 'edit' | 'delete';

export interface RightClickMenuEntry {
	icon: MenuIcon;
	label: string;
	action: () => void;
}
