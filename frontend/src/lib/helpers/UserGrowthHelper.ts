import type { UserGrowthGroupBy } from '$lib/types/managed_user';

const ISO_WEEK = /^(\d{4})-W(\d{2})$/;

export function formatGrowthPeriod(period: string, groupBy: UserGrowthGroupBy): string {
	switch (groupBy) {
		case 'year':
			return period;
		case 'month': {
			const [year, month] = period.split('-');
			return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
		}
		case 'week': {
			const match = period.match(ISO_WEEK);
			return match ? `${match[2]}.${match[1]}` : period;
		}
		case 'day': {
			const [year, month, day] = period.split('-');
			return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		}
	}
}
