<script lang="ts">
	import type { ManagedUser } from '$lib/types/managed_user';
	import SmoothLineChart from '$lib/components/charts/SmoothLineChart.svelte';

	type GroupBy = 'year' | 'month' | 'week' | 'day';

	let { users }: { users: ManagedUser[] } = $props();

	let groupBy = $state<GroupBy>('month');

	const filters: { key: GroupBy; label: string }[] = [
		{ key: 'year', label: 'By Year' },
		{ key: 'month', label: 'By Month' },
		{ key: 'week', label: 'By Week' },
		{ key: 'day', label: 'By Day' }
	];

	function getISOWeekKey(date: Date): string {
		const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
		const dayNum = d.getUTCDay() || 7;
		d.setUTCDate(d.getUTCDate() + 4 - dayNum);
		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
		return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
	}

	function getKey(date: Date, group: GroupBy): string {
		switch (group) {
			case 'year':
				return `${date.getFullYear()}`;
			case 'month':
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			case 'week':
				return getISOWeekKey(date);
			case 'day':
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
		}
	}

	function formatCategory(key: string, group: GroupBy): string {
		switch (group) {
			case 'year':
				return key;
			case 'month': {
				const [y, m] = key.split('-');
				return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', {
					month: 'short',
					year: 'numeric'
				});
			}
			case 'week': {
				const match = key.match(/^(\d{4})-W(\d{2})$/);
				if (match) {
					return `${match[2]}.${match[1]}`;
				}
				return key;
			}
			case 'day': {
				const [y, m, d] = key.split('-');
				return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric'
				});
			}
		}
	}

	function generateKeys(group: GroupBy): string[] {
		const now = new Date();
		const keys: string[] = [];

		if (group === 'day') {
			for (let i = 29; i >= 0; i--) {
				const d = new Date(now);
				d.setDate(d.getDate() - i);
				keys.push(getKey(d, group));
			}
		} else if (group === 'week') {
			for (let i = 51; i >= 0; i--) {
				const d = new Date(now);
				d.setDate(d.getDate() - i * 7);
				keys.push(getKey(d, group));
			}
		}

		return keys;
	}

	function computeGrowthData(
		users: ManagedUser[],
		group: GroupBy
	): { categories: string[]; values: number[] } {
		if (!users.length) return { categories: [], values: [] };

		const now = new Date();
		let rangeUsers = [...users];

		if (group === 'week') {
			const cutoff = new Date(now);
			cutoff.setFullYear(cutoff.getFullYear() - 1);
			rangeUsers = rangeUsers.filter((u) => new Date(u.created_at) >= cutoff);
		} else if (group === 'day') {
			const cutoff = new Date(now);
			cutoff.setDate(cutoff.getDate() - 30);
			rangeUsers = rangeUsers.filter((u) => new Date(u.created_at) >= cutoff);
		}

		const sorted = rangeUsers.sort(
			(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
		);

		const counts = new Map<string, number>();
		for (const user of sorted) {
			const key = getKey(new Date(user.created_at), group);
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}

		let cumulative = 0;
		if (group === 'week' || group === 'day') {
			const cutoff =
				group === 'week'
					? new Date(new Date().setFullYear(now.getFullYear() - 1))
					: new Date(new Date().setDate(now.getDate() - 30));
			cumulative = users.filter((u) => new Date(u.created_at) < cutoff).length;
		}

		const categories: string[] = [];
		const values: number[] = [];

		if (group === 'day' || group === 'week') {
			const allKeys = generateKeys(group);
			for (const key of allKeys) {
				cumulative += counts.get(key) ?? 0;
				categories.push(formatCategory(key, group));
				values.push(cumulative);
			}
		} else {
			for (const key of counts.keys()) {
				cumulative += counts.get(key) ?? 0;
				categories.push(formatCategory(key, group));
				values.push(cumulative);
			}
		}

		return { categories, values };
	}

	let growthData = $derived(computeGrowthData(users, groupBy));
</script>

<div
	class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<div class="mb-4 flex items-center justify-between">
		<h3
			class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5"
		>
			User Growth
		</h3>
		<div class="flex items-center gap-1">
			{#each filters as filter (filter.key)}
				<button
					class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
					class:bg-c-btn={groupBy === filter.key}
					class:text-white={groupBy === filter.key}
					class:bg-c-neutral-1={groupBy !== filter.key}
					class:dark:bg-s-dark-3={groupBy !== filter.key}
					onclick={() => (groupBy = filter.key)}
				>
					{filter.label}
				</button>
			{/each}
		</div>
	</div>
	{#key groupBy}
		<SmoothLineChart categories={growthData.categories} values={growthData.values} filled={true} />
	{/key}
</div>
