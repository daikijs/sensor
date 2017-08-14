import { Injectable, ViewContainerRef } from '@angular/core';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { overlayConfigFactory, DialogRef } from 'angular2-modal';
import { ConfigModalComponent } from './config-modal.component';

@Injectable()
export class ConfigModalService {
	dialog: DialogRef<BSModalContext>;

	constructor(public modal: Modal) {}

	openDialog(configData: any, viewContainer:ViewContainerRef) {
    	this.modal.overlay.defaultViewContainer = viewContainer;
        return this.modal.open(ConfigModalComponent, overlayConfigFactory({configData: configData},BSModalContext));
    };

}
