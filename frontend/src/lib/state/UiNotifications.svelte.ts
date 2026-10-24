import type { UiNotification, UiNotificationRequest } from '$lib/types/ui_notification';
import { setContext, getContext } from 'svelte';
import { v4 as uuid } from 'uuid';

export class UiNotifications {
	queue = $state<UiNotification[]>([]);
	defaultTimeout: number = 5000;

	add(request: UiNotificationRequest): void {
		const notification: UiNotification = {
			id: uuid(),
			...request
		};

		this.queue.push(notification);

		setTimeout(
			() => {
				this.queue = this.queue.filter((n) => n.id !== notification.id);
			},
			notification.timeout ? notification.timeout : this.defaultTimeout
		);
	}

	success(message: string): void {
		this.add({ type: 'success', message });
	}

	error(message: string): void {
		this.add({ type: 'error', message });
	}

	info(message: string): void {
		this.add({ type: 'info', message });
	}

	warning(message: string): void {
		this.add({ type: 'warning', message });
	}

	remove(id: string): void {
		this.queue = this.queue.filter((n) => n.id !== id);
	}

	clear(): void {
		this.queue = [];
	}
}

const UI_NOTIFICATIONS_KEY = Symbol('SOLYTO_UI_NOTIFICATIONS');

export function setUiNotifications(): UiNotifications {
	return setContext(UI_NOTIFICATIONS_KEY, new UiNotifications());
}

export function getUiNotifications(): UiNotifications {
	return getContext<UiNotifications>(UI_NOTIFICATIONS_KEY);
}
