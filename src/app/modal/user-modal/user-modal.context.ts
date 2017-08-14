import { BSModalContext } from 'angular2-modal/plugins/bootstrap';

export class UserModalContext extends BSModalContext {
	constructor(public user: Object, public type: string, public userType: string) {
		super();
	}
}