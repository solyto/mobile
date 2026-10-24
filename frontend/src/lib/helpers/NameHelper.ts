export function getInitials(firstName: string | null, lastName: string | null) {
	let initials = '';

	if (firstName) {
		initials += firstName[0];
	}

	if (lastName) {
		initials += lastName.replace('(', '')[0];
	}

	return initials.toUpperCase();
}
