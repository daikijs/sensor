import { Injectable } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class NotificationService {

	constructor(
		private _service: NotificationsService
	) {

	}

	createNotification(type: string, title: string, content: string) {
		switch (type) {
			case 'success':
				this._service.success(title, content);
				break;

			case 'alert':
				this._service.alert(title, content);
				break;

			case 'error':
				this._service.error(title, content);
				break;

			case 'info':
				this._service.info(title, content);
				break;

			case 'bare':
				this._service.bare(title, content);
				break;
			
			default:
				console.log('The alert type is not existed.');
				break;
		}
	}

}
