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
	CreateTodoWorkspaceRequest,
	UpdateTodoWorkspaceRequest,
	UpdateTodoRequest,
	CreateTodoSubtaskRequest,
	TodoSubtask,
	UpdateTodoSubtaskRequest
} from '$lib/types/todo';
import type { Tag } from '$lib/types/tag';
import { setContext, getContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import { page } from '$app/state';
import TodoFilterService from '$lib/services/TodoFilterService';
import TodoGroupingService from '$lib/services/TodoGroupingService';
import TodoSortingService from '$lib/services/TodoSortingService';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import TodoRelevanceService from '$lib/services/TodoRelevanceService';
import LocalStorageService from '$lib/services/LocalStorageService';
import { SvelteDate } from 'svelte/reactivity';

export class Todos {
	static readonly LS_HIDE_IT_KEY: string = 'todos_hideit';

	loaded = $state<boolean>(false);
	todos = $state<Todo[]>([]);
	filteredTodos = $state<Todo[]>([]);
	groupedTodos = $state<GroupedTodos[]>([]);
	categories = $state<TodoCategory[]>([]);
	filteredCategories = $state<TodoCategory[]>([]);
	workspaces = $state<TodoWorkspace[]>([]);
	activeWorkspace = $state<TodoWorkspace | null>(null);
	activeFilters = $state<TodoFilter[]>([]);
	view = $state<'list' | 'kanban' | 'overview' | 'card'>('list');
	sortByScore = $state<boolean>(false);
	todosScored = $state<boolean>(false);
	hideItActive = $state<boolean>(false);
	recentlyCreated = $state<string | null>(null);
	quickCreateOpen = $state<boolean>(false);
	auth = getAuth();
	apiService: ApiService;
	localStorage = new LocalStorageService();
	filterService = new TodoFilterService();
	sortingService = new TodoSortingService();
	groupingService = new TodoGroupingService();
	relevanceService = new TodoRelevanceService();

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
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
		await Promise.all([this.loadCategories(), this.loadWorkspaces()]);
		this.loadHideIt();
	}

	async loadCategories(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.todos.listCategories);

		if (res) this.categories = res.data as TodoCategory[];
		this.categories = this.sortingService.sortCategories(this.categories);
		this.filteredCategories = this.categories;
	}

	async loadWorkspaces(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.todos.listWorkspaces);

		if (res) {
			this.workspaces = res.data as TodoWorkspace[];
		}
	}

	changeView(view: 'list' | 'kanban' | 'overview' | 'card'): void {
		this.view = view;
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
		const type = page.url.searchParams.get('filterType'),
			value: string | number | null = page.url.searchParams.get('filterValue');

		if (type && value) {
			if (type !== 'workspace') {
				this.addFilter({ type: type as TodoFilterType, value });
			}
		}

		this.useFilters(this.activeFilters);
	}

	useFilters(filters: TodoFilter[]): void {
		this.filteredTodos = this.todos;

		const visibilityThreshold = new SvelteDate();
		visibilityThreshold.setDate(visibilityThreshold.getDate() + 3);
		this.filteredTodos = this.filteredTodos.filter((t) => !t.auto_generated || t.due_at === null || new SvelteDate(t.due_at) <= visibilityThreshold);

		if (!filters.some((f) => f.type === 'status' && f.value === 'backlog')) {
			this.filteredTodos = this.filterService.filterOutBacklog(this.filteredTodos);
		}

		if (
			this.hideItActive &&
			this.activeWorkspace === null &&
			!this.isCategoryFilterActive() &&
			!this.isTagFilterActive()
		) {
			this.filteredTodos = this.filterService.filterByHideIt(
				this.filteredTodos,
				this.workspaces
			);
		}

		for (const filter of filters) {
			this.filteredTodos = this.filterService.filter(filter, this.filteredTodos);
		}

		this.activeFilters = filters;
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

		if (this.activeFilters.some((f) => f.type === 'tag')) {
			request.tags = [this.activeFilters.find((f) => f.type === 'tag')?.value as number];
		}

		if (this.activeFilters.some((f) => f.type === 'category')) {
			request.category_id = this.activeFilters.find((f) => f.type === 'category')?.value as number;
		}

		const res = await this.apiService.create(apiRoutes.todos.create, request);

		if (res) {
			const todo = res.data as Todo;
			this.recentlyCreated = todo.id;
			await this.load();

			setTimeout(() => {
				this.recentlyCreated = null;
			}, 10000);

			return Promise.resolve({ ok: true, recurrenceIgnored });
		}

		return Promise.resolve({ ok: false, recurrenceIgnored: false });
	}

	async delete(todo: Todo): Promise<boolean> {
		const ok = await this.apiService.delete(apiRoutes.todos.delete, todo.id);
		if (ok) await this.load();
		return ok;
	}

	async createCategory(title: string): Promise<TodoCategory | null> {
		const request: CreateTodoCategoryRequest = { title };
		const res = await this.apiService.create(apiRoutes.todos.createCategory, request);
		if (res) await this.loadCategories();
		return res ? (res.data as TodoCategory) : null;
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
		return Promise.resolve(res !== null);
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
		return Promise.resolve(res !== null);
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
		return Promise.resolve(res !== null);
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
		return Promise.resolve(res !== null);
	}

	async changePriority(todo: Todo, priority: TodoPriority): Promise<boolean> {
		const request: UpdateTodoRequest = { priority };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async addTag(todo: Todo, tagId: number): Promise<boolean> {
		const tagIds = todo.tags.map((t) => t.id);
		const request: UpdateTodoRequest = {
			tags: tagIds.concat([tagId])
		};
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async removeTag(todo: Todo, tag: Tag): Promise<boolean> {
		const tagIds = todo.tags.map((t) => t.id);
		const request: UpdateTodoRequest = {
			tags: tagIds.filter((id) => id != tag.id)
		};
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async addCategory(todo: Todo, categoryId: number): Promise<boolean> {
		const request: UpdateTodoRequest = { category_id: categoryId };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async removeCategory(todo: Todo): Promise<boolean> {
		const request: UpdateTodoRequest = { category_id: null };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async changeCompleted(todo: Todo, checked: boolean): Promise<boolean> {
		const request: UpdateTodoRequest = { is_completed: checked };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async changeEffort(todo: Todo, effort: TodoEffort): Promise<boolean> {
		const request: UpdateTodoRequest = { effort };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async changeStatus(todoId: string, status: TodoStatus): Promise<boolean> {
		const request: UpdateTodoRequest = { status };
		const res = await this.apiService.update(apiRoutes.todos.update, todoId, request);
		if (res) await this.load();
		return res;
	}

	async changeProgress(todo: Todo, progress: number): Promise<boolean> {
		const request: UpdateTodoRequest = { progress };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async changeDue(todo: Todo, due_at: string | null): Promise<boolean> {
		const request: UpdateTodoRequest = { due_at };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
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
		if (res) await this.load();
		return res;
	}

	async changeTitle(todo: Todo, title: string): Promise<boolean> {
		const request: UpdateTodoRequest = { title };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async changeDescription(todo: Todo, description: string): Promise<boolean> {
		const request: UpdateTodoRequest = { description };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async changeLink(todo: Todo, link: string | null): Promise<boolean> {
		const request: UpdateTodoRequest = { link };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.load();
		return res;
	}

	async addSubtask(todo: Todo, title: string): Promise<boolean> {
		const request: CreateTodoSubtaskRequest = { title };
		const res = await this.apiService.post(
			apiRoutes.todos.addSubtask.replace('%s', todo.id),
			request
		);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async changeSubtaskTitle(todo: Todo, subtask: TodoSubtask, title: string): Promise<boolean> {
		const request: UpdateTodoSubtaskRequest = { title };
		const res = await this.apiService.put(
			apiRoutes.todos.markSubtask.replace('%s', todo.id).replace('%d', subtask.id.toString()),
			request
		);
		if (res) await this.load();
		return res;
	}

	async markSubtask(todo: Todo, subtask: TodoSubtask, is_completed: boolean): Promise<boolean> {
		const request: UpdateTodoSubtaskRequest = { is_completed };
		const res = await this.apiService.put(
			apiRoutes.todos.markSubtask.replace('%s', todo.id).replace('%d', subtask.id.toString()),
			request
		);
		if (res) await this.load();
		return res;
	}

	async deleteSubtask(todo: Todo, subtask: TodoSubtask): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.todos.deleteSubtask.replace('%d', subtask.id.toString()),
			todo.id
		);
		if (res) await this.load();
		return res;
	}
}

const TODOS_KEY = Symbol('SOLYTO_TODOS');

export function setTodos(): Todos {
	return setContext(TODOS_KEY, new Todos());
}

export function getTodos(): Todos {
	return getContext<Todos>(TODOS_KEY);
}
