import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/svelte';
import DevRequestsPage from '../../src/routes/dev-requests/[[id]]/+page.svelte';
import { renderWithContext } from './helpers/context';
import { devRequest } from '../unit/helpers/factories';

vi.mock('$app/state', () => ({ page: { params: {} } }));
vi.mock('$app/navigation', () => ({ afterNavigate: () => {} }));

const entries = [
	devRequest({ id: 1, title: 'Backlogged', status: 'backlog' }),
	devRequest({ id: 2, title: 'Pending one', status: 'pending' }),
	devRequest({ id: 3, title: 'Being built', status: 'in-progress' }),
	devRequest({ id: 4, title: 'Shipped', status: 'completed' }),
	devRequest({ id: 5, title: 'Declined', status: 'cancelled' })
];

function renderPage(role: 'admin' | 'user', notice: string | null = null) {
	const load = vi.fn().mockResolvedValue(undefined);
	const loadNotice = vi.fn().mockResolvedValue(undefined);
	renderWithContext(DevRequestsPage, {}, { stores: { auth: { user: { id: role, name: role, role } }, devRequests: { entries, notice, load, loadNotice } } });
	return { load, loadNotice };
}

function listTitles(): string[][] {
	return [...document.querySelectorAll('div[class~="md:gap-3"]')].map((list) => [...list.querySelectorAll('.text-lg.font-bold')].map((title) => title.textContent!));
}

describe('Dev requests page', () => {
	it('loads the requests and splits them into current and resolved', () => {
		const { load } = renderPage('user');

		expect(load).toHaveBeenCalledTimes(1);
		expect(screen.getByText('Resolved Requests')).toBeInTheDocument();
		expect(listTitles()).toEqual([['Backlogged', 'Pending one', 'Being built'], ['Shipped', 'Declined']]);
	});

	it('loads the notice together with the requests and shows it', () => {
		const { loadNotice } = renderPage('user', 'Taking a break.\nBack in January.');

		expect(loadNotice).toHaveBeenCalledTimes(1);
		expect(screen.getByText(/Taking a break\.\s+Back in January\./)).toBeInTheDocument();
	});

	it('shows no notice when there is none', () => {
		renderPage('user');

		expect(screen.queryByText(/Taking a break/)).toBeNull();
	});

	it('shows admins each filter with its count', () => {
		renderPage('admin');

		const labels = [...document.querySelectorAll('[role=radio], [role=tab], button')].map((b) => b.textContent!.trim()).filter((t) => /\(\d+\)$/.test(t));
		expect(labels).toEqual(['All (5)', 'Backlog (1)', 'Open (2)', 'In Progress (1)', 'Waiting for Deployment (0)', 'Waiting for User (0)']);
	});
});
