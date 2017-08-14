import { BSModalContext } from 'angular2-modal/plugins/bootstrap';

export class ConfirmModalContext extends BSModalContext {
	constructor(public content: string) {
		super();
	}
}