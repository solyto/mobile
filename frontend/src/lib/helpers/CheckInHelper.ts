import type { CheckIn, CheckInType } from '$lib/types/check_in';

export function getMeanValue(data: CheckIn[], type: CheckInType): number {
	const values: number[] = [];

	for (const entry of data) {
		if (entry[type] !== null && entry[type] !== 0) {
			let value = entry[type] as number;

			if (type === 'food_amount') {
				switch (entry[type]) {
					case 1: value = 1.25; break;
					case 2: value = 2.5; break;
					case 3: value = 3.75; break;
					case 4: value = 5; break;
					case 5: value = 3; break;
				}
			}

			values.push(value);
		}
	}

	return values.reduce((a, b) => a + b, 0) / values.length;
}

export function getTotalMeanValue(data: CheckIn[], types: CheckInType[]): number {
	const values = types.map((t) => getMeanValue(data, t)).filter((v) => !isNaN(v));
	return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}
