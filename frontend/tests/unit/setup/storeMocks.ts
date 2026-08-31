import { vi } from 'vitest';

export const api = {
	list: vi.fn(),
	get: vi.fn(),
	create: vi.fn(),
	createWithStatus: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	post: vi.fn(),
	postRaw: vi.fn(),
	put: vi.fn(),
	postFormData: vi.fn(),
	uploadFile: vi.fn(),
	image: vi.fn()
};

export const storage = {
	get: vi.fn(),
	set: vi.fn(),
	getJson: vi.fn(),
	setJson: vi.fn(),
	getNumber: vi.fn(),
	setNumber: vi.fn(),
	getBool: vi.fn(),
	setBool: vi.fn(),
	destroy: vi.fn()
};

export const auth = {
	getToken: vi.fn(() => 'test-token'),
	user: { settings: {} },
	getPublicProfile: vi.fn(),
	updateNavigation: vi.fn(),
	loadAdditionalData: vi.fn()
};

export const pageState = {
	pathname: '/',
	params: {},
	searchParams: new URL('http://localhost/').searchParams
};

vi.mock('$app/state', () => ({
	page: {
		url: {
			get pathname() {
				return pageState.pathname;
			},
			get searchParams() {
				return pageState.searchParams;
			}
		},
		get params() {
			return pageState.params;
		}
	}
}));

vi.mock('$lib/state/Auth.svelte', () => ({
	getAuth: () => auth,
	setAuth: () => auth
}));

vi.mock('$lib/services/ApiService', () => ({
	default: class FakeApi {
		list = api.list;
		get = api.get;
		create = api.create;
		createWithStatus = api.createWithStatus;
		update = api.update;
		delete = api.delete;
		post = api.post;
		postRaw = api.postRaw;
		put = api.put;
		postFormData = api.postFormData;
		uploadFile = api.uploadFile;
		image = api.image;
	}
}));

vi.mock('$lib/services/LocalStorageService', () => ({
	default: class FakeStorage {
		get = storage.get;
		set = storage.set;
		getJson = storage.getJson;
		setJson = storage.setJson;
		getNumber = storage.getNumber;
		setNumber = storage.setNumber;
		getBool = storage.getBool;
		setBool = storage.setBool;
		destroy = storage.destroy;
	}
}));

export function resetStoreMocks() {
	for (const fn of Object.values(api)) fn.mockReset();
	for (const fn of Object.values(storage)) fn.mockReset();
	auth.getToken.mockReset();
	auth.getPublicProfile.mockReset();
	auth.updateNavigation.mockReset();
	auth.loadAdditionalData.mockReset();

	auth.getToken.mockReturnValue('test-token');
	for (const fn of Object.values(api)) fn.mockResolvedValue(null);

	pageState.pathname = '/';
	pageState.params = {};
	pageState.searchParams = new URL('http://localhost/').searchParams;
}
