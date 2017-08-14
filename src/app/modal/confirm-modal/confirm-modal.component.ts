import { Component,
	OnInit,
	ViewChild
} from '@angular/core';
import { DialogRef, ModalComponent } from 'angular2-modal';
import { ConfirmModalContext } from './confirm-modal.context';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {
	context: ConfirmModalContext;
	confirmContent: string;

	constructor(public dialog: DialogRef<ConfirmModalContext>) {
		this.context = dialog.context;
		this.confirmContent = this.context.content;
	}

	ngOnInit() {
	}

	agree() {
		this.dialog.close('agree');
		return true;
	}

	close() {
		this.dialog.close();
	}

}
