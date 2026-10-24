export interface NotificationSettings {
	music_release_ui: boolean;
	music_release_email: boolean;
	music_release_push: boolean;
	music_release_telegram: boolean;
	book_release_ui: boolean;
	book_release_email: boolean;
	book_release_push: boolean;
	book_release_telegram: boolean;
	friend_request_ui: boolean;
	friend_request_email: boolean;
	friend_request_push: boolean;
	friend_request_telegram: boolean;
	daily_day_reminder_ui: boolean;
	daily_day_reminder_email: boolean;
	daily_day_reminder_push: boolean;
	daily_day_reminder_telegram: boolean;
	daily_check_in_reminder_ui: boolean;
	daily_check_in_reminder_email: boolean;
	daily_check_in_reminder_push: boolean;
	daily_check_in_reminder_telegram: boolean;
	calendar_share_ui: boolean;
	calendar_share_email: boolean;
	calendar_share_push: boolean;
	calendar_share_telegram: boolean;
	dev_request_comment_ui: boolean;
	dev_request_comment_email: boolean;
	dev_request_comment_push: boolean;
    dev_request_comment_telegram: boolean;
    export_ready_ui: boolean;
    export_ready_email: boolean;
    export_ready_push: boolean;
    export_ready_telegram: boolean;
	movie_release_ui: boolean;
	movie_release_email: boolean;
	movie_release_push: boolean;
	movie_release_telegram: boolean;
}

export type NotificationType =
    | 'music_release'
    | 'book_release'
    | 'friend_request'
    | 'daily_day_reminder'
    | 'daily_check_in_reminder'
    | 'calendar_share'
    | 'dev_request_comment'
    | 'export_ready'
    | 'movie_release';
export type NotificationChannel = 'ui' | 'email' | 'push' | 'telegram';
