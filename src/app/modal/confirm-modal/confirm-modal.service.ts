import { Injectable, ViewContainerRef } from '@angular/core';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { overlayConfigFactory } from 'angular2-modal';
import { ConfirmModalComponent } from './confirm-modal.component';

@Injectable()
export class ConfirmModalService {

	constructor(public modal: Modal) {}

	openDialog(content: string, viewContainer: ViewContainerRef) {
		(this.modal as any).confirmViewContainer = viewContainer;
		return this.modal.open(ConfirmModalComponent,
			overlayConfigFactory({content: content}, BSModalContext));
	}

}