export interface UserNotification {
	id: string;
	title: string;
	body: string;
	link: string | null;
	read_at: string | null;
	created_at: string;
}
