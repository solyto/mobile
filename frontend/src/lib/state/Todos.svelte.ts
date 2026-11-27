import type {
	Todo,
	TodoCategory,
	TodoFilter,
	TodoPriority,
	CreateTodoRequest,
	TodoEffort,
	TodoRecurrenceFrequency,
	TodoStatus,
	GroupedTodos,
	TodoFilterType,
	TodoWorkspace,
	CreateTodoCategoryRequest,
	UpdateTodoCategoryRequest,
	CreateTodoWorkspaceRequest,
	UpdateTodoWorkspaceRequest,
	UpdateTodoRequest,
	CreateTodoSubtaskRequest,
	TodoSubtask,
	UpdateTodoSubtaskRequest,
	TodoView
} from '$lib/types/todo';
import type { Tag } from '$lib/types/tag';
import type { Auth } from '$lib/state/Auth.svelte';
import { setContext, getContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import { page } from '$app/state';
import { validate as isUuid } from 'uuid';
import TodoFilterService from '$lib/services/TodoFilterService';
import TodoGroupingService from '$lib/services/TodoGroupingService';
import TodoSortingService from '$lib/services/TodoSortingService';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import TodoRelevanceService from '$lib/services/TodoRelevanceService';
import LocalStorageService from '$lib/services/LocalStorageService';
import { TODO_VIEWS_DESKTOP, TODO_VIEWS_MOBILE } from '$lib/helpers/TodoHelper';

export class Todos {
	static readonly LS_HIDE_IT_KEY: string = 'todos_hideit';
	static readonly LS_VIEW_KEY_DESKTOP: string = 'todos_view_desktop';
	static readonly LS_VIEW_KEY_MOBILE: string = 'todos_view_mobile';
	static readonly LS_VIEW_KEY_LEGACY: string = 'todos_view';
	static readonly RECENTLY_CREATED_MS = 10000;

	loaded = $state<boolean>(false);
	todos = $state<Todo[]>([]);
	filteredTodos = $state<Todo[]>([]);
	groupedTodos = $state<GroupedTodos[]>([]);
	categories = $state<TodoCategory[]>([]);
	filteredCategories = $state<TodoCategory[]>([]);
	workspaces = $state<TodoWorkspace[]>([]);
	activeWorkspace = $state<TodoWorkspace | null>(null);
	activeFilters = $state<TodoFilter[]>([]);
	view = $state<TodoView>('list');
	sortByScore = $state<boolean>(false);
	todosScored = $state<boolean>(false);
	hideItActive = $state<boolean>(false);
	recentlyCreated = $state<string | null>(null);
	createModalOpen = $state<boolean>(false);
	settingsModalVisible = $state<boolean>(false);
	editingTodoId = $state<string | null>(null);
	quickCreateOpen = $state<boolean>(false);

	editingTodo = $derived(this.todos.find((t) => t.id === this.editingTodoId) ?? null);
	private viewKey: string = Todos.LS_VIEW_KEY_DESKTOP;
	auth: Auth;
	apiService: ApiService;
	localStorage: LocalStorageService;
	filterService = new TodoFilterService();
	sortingService = new TodoSortingService();
	groupingService = new TodoGroupingService();
	relevanceService = new TodoRelevanceService();

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		localStorage: LocalStorageService = new LocalStorageService()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.localStorage = localStorage;

		this.hideItActive = this.localStorage.getBool(Todos.LS_HIDE_IT_KEY) ?? false;
	}

	get noTodosYet(): boolean {
		return this.todos.length === 0;
	}

	get isRowView(): boolean {
		return this.view === 'list' || this.view === 'grouped';
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.todos.list);

		if (res) {
			this.loaded = true;
			this.todos = res.data as Todo[];
			this.filteredTodos = this.todos;
			this.checkUrlForFilter();
		}

		if (this.sortByScore) {
			this.loadScores();
		} else {
			this.filteredTodos = this.sortingService.sort(this.filteredTodos);
		}

		this.groupByStatus();

		try {
			await Promise.all([this.loadCategories(), this.loadWorkspaces()]);
		} finally {
			this.loadHideIt();
		}
	}

	async loadCategories(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.todos.listCategories);

		if (res) this.categories = res.data as TodoCategory[];
		this.categories = this.sortingService.sortCategories(this.categories);
		this.filteredCategories = this.categories;
	}

	async loadWorkspaces(retries: number = 1): Promise<void> {
		const res = await this.apiService.list(apiRoutes.todos.listWorkspaces).catch(() => null);

		if (res) {
			this.workspaces = res.data as TodoWorkspace[];
			return;
		}

		if (retries > 0) {
			await this.loadWorkspaces(retries - 1);
		}
	}

	changeView(view: TodoView): void {
		this.view = view;
		this.saveView();
	}

	loadView(isDesktop: boolean): void {
		const allowed = isDesktop ? TODO_VIEWS_DESKTOP : TODO_VIEWS_MOBILE;
		this.viewKey = isDesktop ? Todos.LS_VIEW_KEY_DESKTOP : Todos.LS_VIEW_KEY_MOBILE;
		const stored =
			this.localStorage.get(this.viewKey) ?? this.localStorage.get(Todos.LS_VIEW_KEY_LEGACY);
		this.view = allowed.find((view) => view === stored) ?? allowed[0];
	}

	openEdit(todoId: string): void {
		this.editingTodoId = todoId;
		this.createModalOpen = true;
	}

	openFromUrl(): void {
		const todoId = page.url.searchParams.get('todo');
		if (todoId && isUuid(todoId)) this.openEdit(todoId);
	}

	closeEdit(): void {
		this.editingTodoId = null;
		this.createModalOpen = false;
	}

	openSettingsModal(): void {
		this.settingsModalVisible = true;
	}

	closeSettingsModal(): void {
		this.settingsModalVisible = false;
	}

	toggleSortByScore(): void {
		if (!this.sortByScore) {
			this.loadScores();
		} else {
			this.useFilters(this.activeFilters);
			this.filteredTodos = this.sortingService.sort(this.filteredTodos);
		}

		this.groupByStatus();

		this.sortByScore = !this.sortByScore;
	}

	loadScores(): void {
		this.todos = this.relevanceService.getScoredTodos(this.todos);
		this.todosScored = true;
		this.useFilters(this.activeFilters);
		this.filteredTodos = this.sortingService.sortByScore(this.filteredTodos);
	}

	groupByStatus(): void {
		this.groupedTodos = this.groupingService.groupByStatus(this.filteredTodos);
	}

	checkUrlForFilter(): void {
		const type = page.url.searchParams.get('filterType');
		const value = page.url.searchParams.get('filterValue');

		if (type && value && type !== 'workspace') {
			this.addFilter({ type: type as TodoFilterType, value });
		}

		this.useFilters(this.activeFilters);
	}

	useFilters(filters: TodoFilter[]): void {
		this.activeFilters = filters;
		this.filteredTodos = this.filterService.filterOutDistantAutoGenerated(this.todos);

		if (!filters.some((f) => f.type === 'status' && f.value === 'backlog')) {
			this.filteredTodos = this.filterService.filterOutBacklog(this.filteredTodos);
		}

		if (this.shouldHideIt()) {
			this.filteredTodos = this.filterService.filterByHideIt(this.filteredTodos, this.workspaces);
		}

		for (const filter of filters) {
			this.filteredTodos = this.filterService.filter(filter, this.filteredTodos, this.auth.getWeekStart());
		}

		this.filteredTodos = this.sortingService.sort(this.filteredTodos);
		this.groupByStatus();
	}

	filterCategories(): void {
		if (this.hideItActive) {
			this.filteredCategories = this.filterService.filterCategoriesByHideIt(
				this.categories,
				this.workspaces
			);
		} else {
			this.filteredCategories = this.categories;
		}
	}

	addFilter(filter: TodoFilter): void {
		this.activeFilters.push(filter);
	}

	removeFilter(filter: TodoFilter): void {
		this.activeFilters = this.activeFilters.filter((f) => f !== filter);
	}

	clearFilters(): void {
		this.activeFilters = [];
	}

	isFilterActive(filter: TodoFilter): boolean {
		return this.activeFilters.some((f) => f.type === filter.type && f.value === filter.value);
	}

	isCategoryFilterActive(): boolean {
		return this.activeFilters.some((f) => f.type === 'category');
	}

	isTagFilterActive(): boolean {
		return this.activeFilters.some((f) => f.type === 'tag');
	}

	toggleHideIt(): void {
		this.hideItActive = !this.hideItActive;
		this.useFilters(this.activeFilters);
		this.filterCategories();

		this.localStorage.setBool(Todos.LS_HIDE_IT_KEY, this.hideItActive);
	}

	loadHideIt(): void {
		this.hideItActive = this.localStorage.getBool(Todos.LS_HIDE_IT_KEY) ?? false;
		if (this.hideItActive) {
			this.filterCategories();
			this.useFilters(this.activeFilters);
		}
	}

	async quickCreate(input: string): Promise<{ ok: boolean; recurrenceIgnored: boolean }> {
		const recurrenceIgnored = /repeat:/i.test(input) && !/due:/i.test(input);

		const request: CreateTodoRequest = { title: input };
		const tagFilter = this.activeFilters.find((f) => f.type === 'tag');
		const categoryFilter = this.activeFilters.find((f) => f.type === 'category');
		if (tagFilter) request.tags = [tagFilter.value as number];
		if (categoryFilter) request.category_id = categoryFilter.value as number;

		const res = await this.apiService.create(apiRoutes.todos.create, request);
		if (!res) return { ok: false, recurrenceIgnored: false };

		this.recentlyCreated = (res.data as Todo).id;
		await this.reloadAndNotify(true);
		setTimeout(() => {
			this.recentlyCreated = null;
		}, Todos.RECENTLY_CREATED_MS);

		return { ok: true, recurrenceIgnored };
	}

	async delete(todo: Todo): Promise<boolean> {
		const ok = await this.apiService.delete(apiRoutes.todos.delete, todo.id);
		await this.reloadAndNotify(ok);
		return ok;
	}

	async createCategory(title: string): Promise<TodoCategory | null> {
		const request: CreateTodoCategoryRequest = { title };
		const res = await this.apiService.create(apiRoutes.todos.createCategory, request);
		if (res) await this.loadCategories();
		return res ? (res.data as TodoCategory) : null;
	}

	async updateCategory(
		category: TodoCategory,
		request: UpdateTodoCategoryRequest
	): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.todos.updateCategory,
			category.id,
			request
		);
		if (res) await Promise.all([this.loadCategories(), this.loadWorkspaces()]);
		return res;
	}

	async deleteCategory(category: TodoCategory): Promise<boolean> {
		const ok = await this.apiService.delete(apiRoutes.todos.deleteCategory, category.id);
		if (ok) await this.loadCategories();
		return ok;
	}

	async createWorkspace(title: string): Promise<boolean> {
		const request: CreateTodoWorkspaceRequest = { title };
		const res = await this.apiService.create(apiRoutes.todos.createWorkspace, request);
		if (res) await this.loadWorkspaces();
		return res !== null;
	}

	async deleteWorkspace(workspace: TodoWorkspace): Promise<boolean> {
		const ok = await this.apiService.delete(apiRoutes.todos.deleteWorkspace, workspace.id);
		if (ok) await this.loadWorkspaces();
		return ok;
	}

	async attachCategoryToWorkspace(
		workspace: TodoWorkspace,
		categoryId: number
	): Promise<boolean> {
		const res = await this.apiService.post(
			apiRoutes.todos.attachWorkspaceCategory.replace('%d', workspace.id.toString()),
			{ categories: [categoryId] }
		);
		if (res) await this.loadWorkspaces();
		return res !== null;
	}

	async detachCategoryFromWorkspace(
		workspace: TodoWorkspace,
		categoryId: number
	): Promise<boolean> {
		const res = await this.apiService.post(
			apiRoutes.todos.detachWorkspaceCategory.replace('%d', workspace.id.toString()),
			{ categories: [categoryId] }
		);
		if (res) await this.loadWorkspaces();
		return res !== null;
	}

	async updateWorkspace(
		workspace: TodoWorkspace,
		request: UpdateTodoWorkspaceRequest
	): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.todos.updateWorkspace,
			workspace.id,
			request
		);
		if (res) await this.loadWorkspaces();
		return res;
	}

	async changePriority(todo: Todo, priority: TodoPriority): Promise<boolean> {
		const request: UpdateTodoRequest = { priority };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async addTag(todo: Todo, tagId: number): Promise<boolean> {
		const tagIds = todo.tags.map((t) => t.id);
		const request: UpdateTodoRequest = {
			tags: tagIds.concat([tagId])
		};
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async removeTag(todo: Todo, tag: Tag): Promise<boolean> {
		const tagIds = todo.tags.map((t) => t.id);
		const request: UpdateTodoRequest = {
			tags: tagIds.filter((id) => id != tag.id)
		};
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async addCategory(todo: Todo, categoryId: number): Promise<boolean> {
		const request: UpdateTodoRequest = { category_id: categoryId };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async removeCategory(todo: Todo): Promise<boolean> {
		const request: UpdateTodoRequest = { category_id: null };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async changeCompleted(todo: Todo, checked: boolean): Promise<boolean> {
		const request: UpdateTodoRequest = { is_completed: checked };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async changeEffort(todo: Todo, effort: TodoEffort): Promise<boolean> {
		const request: UpdateTodoRequest = { effort };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async changeStatus(todoId: string, status: TodoStatus): Promise<boolean> {
		const request: UpdateTodoRequest = { status };
		const res = await this.apiService.update(apiRoutes.todos.update, todoId, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async changeProgress(todo: Todo, progress: number): Promise<boolean> {
		const request: UpdateTodoRequest = { progress };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async changeDue(todo: Todo, due_at: string | null): Promise<boolean> {
		const request: UpdateTodoRequest = { due_at };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async changeRecurrence(
		todo: Todo,
		frequency: TodoRecurrenceFrequency | null,
		interval: number = 1,
		endsAt: string | null = null
	): Promise<boolean> {
		const request: UpdateTodoRequest = {
			recurrence_frequency: frequency,
			recurrence_interval: interval,
			recurrence_ends_at: endsAt
		};
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async changeTitle(todo: Todo, title: string): Promise<boolean> {
		const request: UpdateTodoRequest = { title };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async changeDescription(todo: Todo, description: string): Promise<boolean> {
		const request: UpdateTodoRequest = { description };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async changeLink(todo: Todo, link: string | null): Promise<boolean> {
		const request: UpdateTodoRequest = { link };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		await this.reloadAndNotify(res);
		return res;
	}

	async addSubtask(todo: Todo, title: string): Promise<boolean> {
		const request: CreateTodoSubtaskRequest = { title };
		const res = await this.apiService.post(
			apiRoutes.todos.addSubtask.replace('%s', todo.id),
			request
		);
		await this.reloadAndNotify(res !== null);
		return res !== null;
	}

	async changeSubtaskTitle(todo: Todo, subtask: TodoSubtask, title: string): Promise<boolean> {
		const request: UpdateTodoSubtaskRequest = { title };
		const res = await this.apiService.put(
			apiRoutes.todos.markSubtask.replace('%s', todo.id).replace('%d', subtask.id.toString()),
			request
		);
		await this.reloadAndNotify(res);
		return res;
	}

	async markSubtask(todo: Todo, subtask: TodoSubtask, is_completed: boolean): Promise<boolean> {
		const request: UpdateTodoSubtaskRequest = { is_completed };
		const res = await this.apiService.put(
			apiRoutes.todos.markSubtask.replace('%s', todo.id).replace('%d', subtask.id.toString()),
			request
		);
		await this.reloadAndNotify(res);
		return res;
	}

	async deleteSubtask(todo: Todo, subtask: TodoSubtask): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.todos.deleteSubtask.replace('%d', subtask.id.toString()),
			todo.id
		);
		await this.reloadAndNotify(res);
		return res;
	}

	private shouldHideIt(): boolean {
		return this.hideItActive && this.activeWorkspace === null && !this.isCategoryFilterActive() && !this.isTagFilterActive();
	}

	private async reloadAndNotify(changed: boolean): Promise<void> {
		if (!changed) return;
		await this.load();
		this.auth.widgetBridge.notifyChanged();
	}

	private saveView(): void {
		this.localStorage.set(this.viewKey, this.view);
	}
}

const TODOS_KEY = Symbol('SOLYTO_TODOS');

export function setTodos(): Todos {
	return setContext(TODOS_KEY, new Todos());
}

export function getTodos(): Todos {
	return getContext<Todos>(TODOS_KEY);
}
