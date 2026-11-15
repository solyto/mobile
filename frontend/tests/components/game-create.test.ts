import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { apiRoutes } from '$lib/config/apiRoutes';
import { renderWithContext } from './helpers/context';
import GameCreateHarness from './helpers/GameCreateHarness.svelte';

function fakeApi() {
	const genres = [{ id: 1, title: 'RPG' }];
	const tags = [{ id: 5, name: 'Couch' }];
	return {
		list: vi.fn(async (endpoint: string) => {
			if (endpoint === apiRoutes.libraries.games.listGenres) return { data: [...genres] };
			if (endpoint === apiRoutes.tags.list) return { data: [...tags] };
			return { data: [] };
		}),
		create: vi.fn(async (endpoint: string, body: { title?: string; name?: string }): Promise<{ data: unknown } | null> => {
			if (endpoint === apiRoutes.libraries.games.createGenre) {
				genres.push({ id: 42, title: body.title! });
				return { data: genres.at(-1) };
			}
			if (endpoint === apiRoutes.tags.create) {
				tags.push({ id: 9, name: body.name! });
				return { data: tags.at(-1) };
			}
			return { data: {} };
		})
	};
}

function listCalls(api: ReturnType<typeof fakeApi>, endpoint: string): number {
	return api.list.mock.calls.filter(([called]) => called === endpoint).length;
}

function createGameRequest(api: ReturnType<typeof fakeApi>) {
	const call = api.create.mock.calls.find(([endpoint]) => endpoint === apiRoutes.libraries.games.create);
	return call?.[1] as { genres: number[]; tags: number[] } | undefined;
}

describe('GameCreate', () => {
	it('saves a game with a genre and a tag created from the input', async () => {
		const user = userEvent.setup();
		const api = fakeApi();
		renderWithContext(GameCreateHarness, {}, { stores: { auth: { apiService: api } } });

		await waitFor(() => expect(listCalls(api, apiRoutes.tags.list)).toBe(1));

		const [genreInput, tagInput] = screen.getAllByRole('searchbox');
		await user.type(genreInput, 'Roguelike{Enter}');
		await user.type(tagInput, 'Replay{Enter}');
		await waitFor(() => expect(listCalls(api, apiRoutes.tags.list)).toBe(2));
		await user.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => expect(createGameRequest(api)).toBeDefined());
		expect(createGameRequest(api)).toMatchObject({ genres: [42], tags: [9] });
	});

	it('leaves out a genre that could not be created', async () => {
		const user = userEvent.setup();
		const api = fakeApi();
		api.create.mockImplementationOnce(async () => null);
		renderWithContext(GameCreateHarness, {}, { stores: { auth: { apiService: api } } });
		await waitFor(() => expect(listCalls(api, apiRoutes.libraries.games.listGenres)).toBe(1));

		await user.type(screen.getAllByRole('searchbox')[0], 'Roguelike{Enter}');
		await waitFor(() => expect(api.create).toHaveBeenCalledWith(apiRoutes.libraries.games.createGenre, { title: 'Roguelike' }));
		await user.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => expect(createGameRequest(api)).toBeDefined());
		expect(createGameRequest(api)).toMatchObject({ genres: [] });
	});
});
