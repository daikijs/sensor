import { BSModalContext } from 'angular2-modal/plugins/bootstrap';

export class ConfigModalContext extends BSModalContext {
	constructor(public configData: any) {
		super();
	}
}