import { getApiUrl } from '$lib/config/platform';

const BASE_URL = getApiUrl();
const API_URL = `${BASE_URL}/api/v1`;
export const API_STORAGE_URL = `${BASE_URL}/storage`;
export const API_USER_STORAGE_URL = `${BASE_URL}/storage/user`;

export const apiRoutes = {
	auth: {
		login: API_URL + '/auth/login',
		refresh: API_URL + '/auth/refresh',
		register: API_URL + '/auth/register',
		verify: API_URL + '/auth/verify',
		forgotPassword: API_URL + '/auth/forgot-password',
		resetPassword: API_URL + '/auth/reset-password',
		passkeys: {
			registerOptions: API_URL + '/auth/passkeys/register-options',
			register: API_URL + '/auth/passkeys/register',
			authenticateOptions: API_URL + '/auth/passkey/authenticate-options',
			authenticate: API_URL + '/auth/passkey/authenticate',
			list: API_URL + '/auth/passkeys',
			update: API_URL + '/auth/passkeys/%s',
			delete: API_URL + '/auth/passkeys/%s',
		},
	},
	users: {
		get: API_URL + '/users/me',
		updateProfileImage: API_URL + '/users/me/profile-image',
		getPublicProfile: API_URL + '/users/%s/public-profile',
		settings: {
			updateNavigationSettings: API_URL + '/users/me/settings/navigation',
			updateTimezone: API_URL + '/users/me/settings/timezone',
			updateDateFormat: API_URL + '/users/me/settings/date-format',
			updateTimeFormat: API_URL + '/users/me/settings/time-format',
			updateOpenaiApiKey: API_URL + '/users/me/settings/openai-api-key',
			updateLanguage: API_URL + '/users/me/settings/language',
			completeOnboarding: API_URL + '/users/me/settings/complete-onboarding',
			updateWeatherCity: API_URL + '/users/me/settings/weather-city',
			updateWeatherTemperatureUnit: API_URL + '/users/me/settings/weather-temperature-unit',
			updateCheckInSettings: API_URL + '/users/me/settings/check-in'
		}
	},
	todos: {
		list: API_URL + '/todos',
		listDueDate: API_URL + '/todos/due-date',
		get: API_URL + '/todos/%s',
		create: API_URL + '/todos',
		update: API_URL + '/todos/%s',
		delete: API_URL + '/todos/%s',
		listCategories: API_URL + '/todos/categories',
		createCategory: API_URL + '/todos/categories',
		deleteCategory: API_URL + '/todos/categories/%d',
		listWorkspaces: API_URL + '/todos/workspaces',
		createWorkspace: API_URL + '/todos/workspaces',
		updateWorkspace: API_URL + '/todos/workspaces/%d',
		deleteWorkspace: API_URL + '/todos/workspaces/%d',
		attachWorkspaceCategory: API_URL + '/todos/workspaces/%d/categories/attach',
		detachWorkspaceCategory: API_URL + '/todos/workspaces/%d/categories/detach',
		changeWorkspaceDefaultStatus: API_URL + '/todos/workspaces/%d/default',
		addSubtask: API_URL + '/todos/%s/subtasks',
		markSubtask: API_URL + '/todos/%s/subtasks/%d',
		deleteSubtask: API_URL + '/todos/%s/subtasks/%d'
	},
	tags: {
		list: API_URL + '/tags',
		create: API_URL + '/tags',
		update: API_URL + '/tags/%d',
		delete: API_URL + '/tags/%d'
	},
	checkIn: {
		list: API_URL + '/check-in',
		create: API_URL + '/check-in',
		update: API_URL + '/check-in/%s'
	},
	notes: {
		list: API_URL + '/notes',
		get: API_URL + '/notes/%s',
		create: API_URL + '/notes',
		update: API_URL + '/notes/%s',
		delete: API_URL + '/notes/%s',
		newest: API_URL + '/notes/newest',
		import: API_URL + '/notes/import',
		export: API_URL + '/notes/export',
		listCategories: API_URL + '/notes/categories',
		createCategory: API_URL + '/notes/categories',
		updateCategory: API_URL + '/notes/categories/%d',
		deleteCategory: API_URL + '/notes/categories/%d'
	},
	weather: {
		today: API_URL + '/weather/today'
	},
	libraries: {
		music: {
			list: API_URL + '/libraries/music',
			get: API_URL + '/libraries/music/%s',
			recommend: API_URL + '/libraries/music/recommend/%s',
			releases: API_URL + '/libraries/music/releases',
			create: API_URL + '/libraries/music',
			update: API_URL + '/libraries/music/%s',
			delete: API_URL + '/libraries/music/%s',
			listGenres: API_URL + '/libraries/music/genres',
			createGenre: API_URL + '/libraries/music/genres',
			deleteGenre: API_URL + '/libraries/music/genres/%d',
			search: API_URL + '/libraries/music/search',
			import: API_URL + '/libraries/music/import'
		},
		books: {
			list: API_URL + '/libraries/books',
			get: API_URL + '/libraries/books/%s',
			recommend: API_URL + '/libraries/books/recommend/%s',
			releases: API_URL + '/libraries/books/releases',
			create: API_URL + '/libraries/books',
			update: API_URL + '/libraries/books/%s',
			delete: API_URL + '/libraries/books/%s',
			listGenres: API_URL + '/libraries/books/genres',
			createGenre: API_URL + '/libraries/books/genres',
			deleteGenre: API_URL + '/libraries/books/genres/%d',
			search: API_URL + '/libraries/books/search',
			import: API_URL + '/libraries/books/import'
		},
		movies: {
			list: API_URL + '/libraries/movies',
			get: API_URL + '/libraries/movies/%s',
			create: API_URL + '/libraries/movies',
			update: API_URL + '/libraries/movies/%s',
			delete: API_URL + '/libraries/movies/%s',
			listGenres: API_URL + '/libraries/movies/genres',
			createGenre: API_URL + '/libraries/movies/genres',
			deleteGenre: API_URL + '/libraries/movies/genres/%d',
			releases: API_URL + '/libraries/movies/releases',
			trailers: API_URL + '/libraries/movies/%s/trailers',
			search: API_URL + '/libraries/movies/search',
			import: API_URL + '/libraries/movies/import'
		},
		games: {
			list: API_URL + '/libraries/games',
			get: API_URL + '/libraries/games/%s',
			create: API_URL + '/libraries/games',
			update: API_URL + '/libraries/games/%s',
			delete: API_URL + '/libraries/games/%s',
			listGenres: API_URL + '/libraries/games/genres',
			createGenre: API_URL + '/libraries/games/genres',
			deleteGenre: API_URL + '/libraries/games/genres/%d',
			search: API_URL + '/libraries/games/search',
			import: API_URL + '/libraries/games/import'
		},
		links: {
			list: API_URL + '/libraries/links',
			create: API_URL + '/libraries/links',
			update: API_URL + '/libraries/links/%s',
			delete: API_URL + '/libraries/links/%s',
			listCategories: API_URL + '/libraries/links/categories',
			createCategory: API_URL + '/libraries/links/categories',
			updateCategory: API_URL + '/libraries/links/categories/%d',
			deleteCategory: API_URL + '/libraries/links/categories/%d',
			newest: API_URL + '/libraries/links/newest'
		},
		quotes: {
			list: API_URL + '/libraries/quotes',
			getRandom: API_URL + '/libraries/quotes/random',
			create: API_URL + '/libraries/quotes',
			update: API_URL + '/libraries/quotes/%s',
			delete: API_URL + '/libraries/quotes/%s'
		},
		recipes: {
			list: API_URL + '/libraries/recipes',
			create: API_URL + '/libraries/recipes',
			update: API_URL + '/libraries/recipes/%s',
			delete: API_URL + '/libraries/recipes/%s',
			import: API_URL + '/libraries/recipes/import'
		},
		plants: {
			list: API_URL + '/libraries/plants',
			get: API_URL + '/libraries/plants/%s',
			create: API_URL + '/libraries/plants',
			update: API_URL + '/libraries/plants/%s',
			delete: API_URL + '/libraries/plants/%s',
			uploadCover: API_URL + '/libraries/plants/%s/cover'
		},
		getCover: API_URL + '/libraries/covers/'
	},
	dev: {
		requests: {
			list: API_URL + '/dev-requests',
			create: API_URL + '/dev-requests',
			update: API_URL + '/dev-requests/%d',
			delete: API_URL + '/dev-requests/%d',
			vote: API_URL + '/dev-requests/%d/vote',
			listComments: API_URL + '/dev-requests/%d/comments',
			createComment: API_URL + '/dev-requests/%d/comments'
		}
	},
	telegram: {
		getToken: API_URL + '/telegram/token-request',
		getRequest: API_URL + '/telegram/request',
		updateYourDayAlert: API_URL + '/telegram/your-day-alert',
		updateCheckInAlert: API_URL + '/telegram/check-in-alert'
	},
	finances: {
		wealth: {
			listFields: API_URL + '/finances/wealth/fields',
			createField: API_URL + '/finances/wealth/fields',
			updateField: API_URL + '/finances/wealth/fields/%d',
			deleteField: API_URL + '/finances/wealth/fields/%d',
			updateValue: API_URL + '/finances/wealth/fields/%d/value'
		},
		budget: {
			list: API_URL + '/finances/budget',
			create: API_URL + '/finances/budget',
			update: API_URL + '/finances/budget/%d',
			delete: API_URL + '/finances/budget/%d'
		}
	},
	feeds: {
		list: API_URL + '/feeds/subscriptions',
		create: API_URL + '/feeds/subscriptions',
		update: API_URL + '/feeds/subscriptions/%s',
		delete: API_URL + '/feeds/subscriptions/%s',
		listItems: API_URL + '/feeds/items',
		testFeed: API_URL + '/feeds/test',
		available: API_URL + '/feeds/available',
		search: API_URL + '/feeds/search',
		friendFeeds: API_URL + '/feeds/friends'
	},
	shortcuts: {
		list: API_URL + '/shortcuts',
		create: API_URL + '/shortcuts',
		update: API_URL + '/shortcuts/%s',
		delete: API_URL + '/shortcuts/%s',
		reorder: API_URL + '/shortcuts/reorder'
	},
	statistics: {
		overview: API_URL + '/statistics/overview'
	},
	admin: {
		users: {
			list: API_URL + '/users',
			update: API_URL + '/users/%s'
		}
	},
	friends: {
		list: API_URL + '/friends',
		listRequests: API_URL + '/friends/requests',
		createRequest: API_URL + '/friends/requests',
		acceptRequest: API_URL + '/friends/requests/%d/accept',
		rejectRequest: API_URL + '/friends/requests/%d/reject'
	},
	notifications: {
		list: API_URL + '/notifications',
		markRead: API_URL + '/notifications/%s/read',
		markAllRead: API_URL + '/notifications/read-all',
		push: {
			getVapidKey: API_URL + '/notifications/push/vapid-key',
			subscribe: API_URL + '/notifications/push/subscribe',
			unsubscribe: API_URL + '/notifications/push/unsubscribe'
		},
		settings: {
			get: API_URL + '/notifications/settings',
			update: API_URL + '/notifications/settings'
		}
	},
	clipboard: {
		list: API_URL + '/clipboard',
		create: API_URL + '/clipboard',
		createImage: API_URL + '/clipboard/image',
		getImage: API_URL + '/clipboard/%d/image',
		delete: API_URL + '/clipboard/%d'
	},
	timeTracking: {
		categories: {
			list: API_URL + '/time-tracking/categories',
			create: API_URL + '/time-tracking/categories',
			update: API_URL + '/time-tracking/categories/%d',
			delete: API_URL + '/time-tracking/categories/%d'
		},
		projects: {
			list: API_URL + '/time-tracking/projects',
			get: API_URL + '/time-tracking/projects/%s',
			create: API_URL + '/time-tracking/projects',
			update: API_URL + '/time-tracking/projects/%s',
			delete: API_URL + '/time-tracking/projects/%s'
		},
		entries: {
			list: API_URL + '/time-tracking/entries',
			create: API_URL + '/time-tracking/entries',
			update: API_URL + '/time-tracking/entries/%s',
			delete: API_URL + '/time-tracking/entries/%s',
			start: API_URL + '/time-tracking/entries/start',
			stop: API_URL + '/time-tracking/entries/%s/stop',
			statistics: API_URL + '/time-tracking/entries/statistics'
		}
	},
	export: {
		start: API_URL + '/export',
		status: API_URL + '/export/status',
		download: API_URL + '/export/%s/download'
	},
	calendars: {
		listCalendars: API_URL + '/calendars',
		createCalendar: API_URL + '/calendars',
		updateCalendarColor: API_URL + '/calendars/%d',
		updateCalendarsOrder: API_URL + '/calendars/order',
		deleteCalendar: API_URL + '/calendars/%d',
		listEvents: API_URL + '/calendars/events/%s',
		listWidgetEvents: API_URL + '/calendars/events/widget',
		createEvent: API_URL + '/calendars/%d/events',
		updateEvent: API_URL + '/calendars/%d/events/%s',
		deleteEvent: API_URL + '/calendars/%d/events/%s',
		updateOccurrence: API_URL + '/calendars/%d/events/%s/occurrence/%s',
		deleteOccurrence: API_URL + '/calendars/%d/events/%s/occurrence/%s',
		startImport: API_URL + '/calendars/import',
		selectImportCalendars: API_URL + '/calendars/import/select',
		getImportState: API_URL + '/calendars/import/state',
		listSharees: API_URL + '/calendars/%d/share',
		shareCalendar: API_URL + '/calendars/%d/share',
		revokeShare: API_URL + '/calendars/%d/share/%s',
		unsubscribe: API_URL + '/calendars/%d/unsubscribe',
		listInvites: API_URL + '/calendars/invites',
		acceptInvite: API_URL + '/calendars/invites/%s/accept',
		declineInvite: API_URL + '/calendars/invites/%s/decline',
		eventAttachmentTodos: API_URL + '/calendars/events/%d/attachments/todos',
		eventAttachmentNotes: API_URL + '/calendars/events/%d/attachments/notes',
		eventDetachTodo: API_URL + '/calendars/events/%d/attachments/todos/%s',
		eventDetachNote: API_URL + '/calendars/events/%d/attachments/notes/%s'
	},
	contacts: {
		listAddressBooks: API_URL + '/address-books',
		createAddressBook: API_URL + '/address-books',
		updateAddressBook: API_URL + '/address-books/%d',
		deleteAddressBook: API_URL + '/address-books/%d',
		listContacts: API_URL + '/address-books/contacts',
		createContact: API_URL + '/address-books/%d/contacts',
		updateContact: API_URL + '/address-books/%d/contacts/%s',
		updateContactPhoto: API_URL + '/address-books/%d/contacts/%s/photo',
		removeContactPhoto: API_URL + '/address-books/%d/contacts/%s/photo',
		deleteContact: API_URL + '/address-books/%d/contacts/%s',
		getContactPhotos: API_URL + '/address-books/contacts/photos',
		startImport: API_URL + '/address-books/import',
		selectImportAddressBooks: API_URL + '/address-books/import/select',
		getImportState: API_URL + '/address-books/import/state'
	},
	dashboard: {
		quickAddDetect: API_URL + '/dashboard/quick-add/detect',
		quickAddCommit: API_URL + '/dashboard/quick-add/commit'
	}
} as const;
