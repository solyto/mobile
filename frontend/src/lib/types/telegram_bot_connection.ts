export interface Connection {
	token: string | null;
	is_confirmed: boolean;
	your_day_alert: boolean;
	check_in_alert: boolean;
	chat_id: string | null;
	created_at: string;
}
