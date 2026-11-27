import { describe, it, expect, vi } from 'vitest';
import { createdEntryValue, genreEntries, selectedIds, tagEntries } from '$lib/helpers/MultiSelectHelper';
import { genre, tag } from './factories';

describe('MultiSelectHelper', () => {
	it('turns tags and genres into entries labelled by name or title', () => {
		expect(tagEntries([tag(3, 'Home')])).toEqual([{ label: 'Home', value: '3' }]);
		expect(genreEntries([genre(7, 'Fantasy')])).toEqual([{ label: 'Fantasy', value: '7' }]);
	});

	it('reads the ids back, leaving out entries still waiting for one', () => {
		expect(selectedIds([{ label: 'Home', value: '3' }, { label: 'New', value: '' }, { label: 'Work', value: '12' }])).toEqual([3, 12]);
	});

	it('gives the id of a created tag or genre as the entry value', async () => {
		const onFailure = vi.fn();
		expect(await createdEntryValue(Promise.resolve(tag(9, 'Replay')), onFailure)).toBe('9');
		expect(onFailure).not.toHaveBeenCalled();
	});

	it('reports a failed creation and gives no value', async () => {
		const onFailure = vi.fn();
		expect(await createdEntryValue(Promise.resolve(null), onFailure)).toBeNull();
		expect(onFailure).toHaveBeenCalledTimes(1);
	});
});
