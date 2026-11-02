function firstLetter(name: string | null): string {
	return name?.match(/\p{L}/u)?.[0] ?? '';
}

export function getInitials(firstName: string | null, lastName: string | null) {
	return (firstLetter(firstName) + firstLetter(lastName)).toUpperCase();
}
