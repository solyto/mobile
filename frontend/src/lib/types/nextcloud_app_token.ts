export interface NextcloudAppToken {
	id: number;
	nextcloud_url: string;
	username: string;
	app_token: string;
	created_at: string;
	updated_at: string;
}

export interface CreateNextcloudAppTokenRequest {
	nextcloud_url: string;
	username: string;
	app_token: string;
}

export interface UpdateNextcloudAppTokenRequest {
	nextcloud_url: string;
	username: string;
	app_token: string;
}
