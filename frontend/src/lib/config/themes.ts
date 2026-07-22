export type Theme = {
	id: string;
	name: string;
	supportsDarkMode: boolean;
	previewBg: string;
	previewSurface: string;
	previewText: string;
	previewAccent: string;
}

export const themes: Theme[] = [
	{
		id: 'default',
		name: 'Default',
		supportsDarkMode: true,
		previewBg: '#121212',
		previewSurface: '#222222',
		previewText: '#ffffff',
		previewAccent: '#14a5cd'
	},
	{
		id: 'nord',
		name: 'Nord',
		supportsDarkMode: false,
		previewBg: '#2e3440',
		previewSurface: '#3b4252',
		previewText: '#eceff4',
		previewAccent: '#88c0d0'
	},
	{
		id: 'skyrim',
		name: 'Skyrim',
		supportsDarkMode: false,
		previewBg: '#0e0e12',
		previewSurface: '#16161e',
		previewText: '#e8e4dc',
		previewAccent: '#a09880'
	},
	{
		id: 'catppuccin-mocha',
		name: 'Catppuccin Mocha',
		supportsDarkMode: false,
		previewBg: '#1e1e2e',
		previewSurface: '#313244',
		previewText: '#cdd6f4',
		previewAccent: '#cba6f7'
	},
	{
		id: 'catppuccin-latte',
		name: 'Catppuccin Latte',
		supportsDarkMode: false,
		previewBg: '#eff1f5',
		previewSurface: '#e6e9ef',
		previewText: '#4c4f69',
		previewAccent: '#8839ef'
	},
	{
		id: 'gruvbox',
		name: 'Gruvbox',
		supportsDarkMode: false,
		previewBg: '#282828',
		previewSurface: '#3c3836',
		previewText: '#ebdbb2',
		previewAccent: '#fe8019'
	},
	{
		id: 'dracula',
		name: 'Dracula',
		supportsDarkMode: false,
		previewBg: '#282a36',
		previewSurface: '#44475a',
		previewText: '#f8f8f2',
		previewAccent: '#bd93f9'
	},
	{
		id: 'terminal',
		name: 'Terminal',
		supportsDarkMode: false,
		previewBg: '#0d0d0d',
		previewSurface: '#0a1a0a',
		previewText: '#00ff41',
		previewAccent: '#00ff41'
	},
	{
		id: 'paper',
		name: 'Paper',
		supportsDarkMode: false,
		previewBg: '#faf9f7',
		previewSurface: '#f3f0eb',
		previewText: '#1c1917',
		previewAccent: '#92400e'
	},
	{
		id: 'atari',
		name: 'Atari',
		supportsDarkMode: false,
		previewBg: '#000000',
		previewSurface: '#0d0020',
		previewText: '#ffffff',
		previewAccent: '#ff6600'
	},
]
