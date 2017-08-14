import { Component,
	OnInit,
	ViewChild
} from '@angular/core';
import { environment }               from '../../../environments/environment';
import { DialogRef, ModalComponent } from 'angular2-modal';
import { UserModalContext }          from './user-modal.context';
import { AuthService }               from '../../service/auth.service';
import { HttpService }               from '../../service/http.service';
import { NotificationService }       from '../../service/notification.service';

export interface User {
    email: string;
    password: string;
    confirmPassword: string;
    role: string,
    type: string
}

@Component({
	selector: 'app-user-modal',
	templateUrl: './user-modal.component.html',
	styleUrls: ['./user-modal.component.scss']
})
export class UserModalComponent implements ModalComponent<UserModalContext> ,OnInit {
	context: UserModalContext;
	user: User;
	userType: string;

	roles: any[];
	staffRoles: any[];
	customerRoles: any[];

	TYPES: string[];
	USERTYPES: Object[];

	error: string;
	type: string;
	title: string;
	isSaving: boolean;

	constructor(public dialog: DialogRef<UserModalContext>,
		private _httpService: HttpService,
		private _nofication: NotificationService,
		private _authService: AuthService) {
		this.context = dialog.context;
		this.type = this.context.type;
		let role = (this.context.user as any).action['role'];console.log(this.context);
		this.userType = (this.context as any).userType;

		this.user = {
	    	email: '',
	    	password: '',
	    	confirmPassword: '',
	    	role: role,
	    	type: this.userType
	    };

	    this.TYPES = ['create', 'edit'];

	    this.USERTYPES = [
	    	{value: 'staff', display: 'Omniscent Staff'},
			{value: 'customer', display: 'Customer'}
	    ];

		this.staffRoles = [
			{value: 'admin', display: 'Administrator'},
			{value: 'developer', display: 'Developer'},
			{value: 'debugger', display: 'Debug Operator'},
			{value: 'operator', display: 'Operator'},
			{value: 'viewer', display: 'Viewer'}
		];

		this.customerRoles = [
			{value: 'admin', display: 'Administrator'},
			{value: 'operator', display: 'Operator'},
			{value: 'viewer', display: 'Viewer'}
		];

		if( this.userType === (this.USERTYPES[0] as any).value ) {
			this.roles = this.staffRoles;
		} else {
			this.roles = this.customerRoles;
		}

		// check the type
		if(this.type === this.TYPES[0]) { // create
			this.title = 'Create New User';
		} else {
			this.title = 'Edit the user info';
		}
	}

	ngOnInit() {
	}

	submit(model: User, isValid: boolean) {
		this.user = model;
		// call API to save customer
		this.error = '';
		// create new user
		if(this.type === this.TYPES[0]) {
			if(isValid) {
				if(model.confirmPassword === model.password && model.role !== '') {

					this.isSaving = false;
				    this._authService.signUp(model.email, model.password)
						.then((res) => {
							if((res as any).provider === 4) {
								this.isSaving = true;
								this.saveUser(res);
								this._nofication.createNotification('success', 'Sign up', 'Sign Up Successful!');
							} else {
								console.log(111);
							}
						})
						.catch((ex) => {
						    console.error('Error fetching users', ex);
						});
					this.dialog.close();
				} else if(model.role === '') {
					this.error = 'Please set the role.';
				} else {
					this.error = "The Password mismatch.";
				}
			}
		} else {

	        let value = {role: model.role};
			let selectedUser = (this.context as any).user;
	        let url;
			let typeName;
			url = environment.APIS.USERS + '/';

			if(this.userType === 'staff') {
				typeName = 'staffs/';
				
			} else {
				typeName = 'customers/';
			}

			url += typeName;
			url += (selectedUser as any).$key;
			url += '/action';

			this._httpService.updateAsObject(url, value)
	            .then(
	                res  => {
	                	this._nofication.createNotification('success', 'Alert', 'The role update successfully');
	                },
	                error =>  console.error(error));

	        this.dialog.close();
		}
		
		
	}

	// save the user to the user table 
	saveUser(user: any, count: number = 0) {
		let newUser = {
			email: user.auth.email,
			role: this.user.role
		}

		let url = environment.APIS.USERS;

		this._httpService.postAsObject(`${url}/${this.user.type}s/${user.uid}`, newUser)
            .then(
                res  => {
                	console.log('One user is created successfully.');
                },
                error =>  console.error(error));
	}

	close() {
		this.dialog.close();
	}

}
