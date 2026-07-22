export type UiNotificationType = 'success' | 'error' | 'info' | 'warning';

export interface UiNotificationRequest {
	type: UiNotificationType;
	message: string;
	timeout?: number;
}

export interface UiNotification extends UiNotificationRequest {
	id: string;
}
