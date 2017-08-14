import { Injectable, ViewContainerRef } from '@angular/core';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { overlayConfigFactory } from 'angular2-modal';
import { UserModalComponent } from './user-modal.component';

@Injectable()
export class UserModalService {

	constructor(public modal: Modal) {}

	openDialog(user: Object, type: string, userType: string, viewContainer: ViewContainerRef) {
		(this.modal as any).userViewContainer = viewContainer;
		return this.modal.open(UserModalComponent,
			overlayConfigFactory({user: user, type: type, userType: userType}, BSModalContext));
	}

}
