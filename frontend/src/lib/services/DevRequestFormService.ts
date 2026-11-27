import type {
	CreateDevRequestRequest,
	DevRequest,
	DevRequestForm,
	DevRequestPriority,
	DevRequestStatus,
	DevRequestType,
	UpdateDevRequestRequest
} from '$lib/types/dev_request';

export default class DevRequestFormService {
	empty(): DevRequestForm {
		return {
			title: '',
			description: '',
			type: 'bug',
			priority: '1',
			status: 'backlog',
			screenshot: '',
			screenshot_name: '',
			url: '',
			fixed_in_version: ''
		};
	}

	fromEntry(entry: DevRequest): DevRequestForm {
		return {
			...this.empty(),
			title: entry.title,
			description: entry.description,
			type: entry.type,
			priority: String(entry.priority ?? 1),
			status: entry.status,
			fixed_in_version: entry.fixed_in_version ?? ''
		};
	}

	isComplete(form: DevRequestForm): boolean {
		return form.title !== '' && form.description !== '';
	}

	// Only a changed version is checked: older requests may hold e.g. `1.2`, which the API accepts.
	versionToCheck(form: DevRequestForm, entry: DevRequest | undefined): string | null {
		const version = form.fixed_in_version.trim();
		const changed = version !== (entry?.fixed_in_version ?? '');
		return form.status === 'completed' && version !== '' && changed ? version : null;
	}

	createRequest(form: DevRequestForm, userId: string | null): CreateDevRequestRequest {
		return {
			title: form.title,
			description: form.description,
			screenshot: form.screenshot != '' ? form.screenshot : null,
			screenshot_name: form.screenshot_name != '' ? form.screenshot_name : null,
			priority: this.priority(form),
			url: form.url,
			type: form.type as DevRequestType,
			created_by_user_id: userId
		};
	}

	changes(entry: DevRequest, form: DevRequestForm): UpdateDevRequestRequest {
		const request: UpdateDevRequestRequest = {};
		const fixedInVersion = form.status === 'completed' ? form.fixed_in_version.trim() || null : null;
		const storedPriority = String(entry.priority ?? 1);

		if (form.title !== entry.title) request.title = form.title;
		if (form.description !== entry.description) request.description = form.description;
		if (form.type !== entry.type) request.type = form.type as DevRequestType;
		if (form.priority !== storedPriority) request.priority = this.priority(form);
		if (form.status !== entry.status) request.status = form.status as DevRequestStatus;
		if (fixedInVersion !== (entry.fixed_in_version ?? null)) request.fixed_in_version = fixedInVersion;

		return request;
	}

	private priority(form: DevRequestForm): DevRequestPriority {
		return parseInt(form.priority) as DevRequestPriority;
	}
}
