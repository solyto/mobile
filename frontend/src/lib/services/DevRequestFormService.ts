import type {
	DevRequest,
	DevRequestForm,
	DevRequestPriority,
	DevRequestStatus,
	DevRequestType,
	UpdateDevRequestRequest
} from '$lib/types/dev_request';
import { buildVersion, parseVersion } from '$lib/helpers/VersionHelper';

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
			fixed_in_version: parseVersion(null)
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
			fixed_in_version: parseVersion(entry.fixed_in_version)
		};
	}

	changes(entry: DevRequest, form: DevRequestForm): UpdateDevRequestRequest {
		const request: UpdateDevRequestRequest = {};
		const fixedInVersion = form.status === 'completed' ? buildVersion(form.fixed_in_version) : null;

		if (form.title !== entry.title) request.title = form.title;
		if (form.description !== entry.description) request.description = form.description;
		if (form.type !== entry.type) request.type = form.type as DevRequestType;
		if (form.priority !== String(entry.priority ?? 1)) request.priority = parseInt(form.priority) as DevRequestPriority;
		if (form.status !== entry.status) request.status = form.status as DevRequestStatus;
		if (fixedInVersion !== (entry.fixed_in_version ?? null)) request.fixed_in_version = fixedInVersion;

		return request;
	}
}
