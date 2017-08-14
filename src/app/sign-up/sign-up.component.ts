import { Component,
	OnInit
} from '@angular/core';
import { Router,
	ActivatedRoute
} from '@angular/router';
import { FormGroup,
	FormBuilder,
	Validators,
	FormControl
} from '@angular/forms';
import { environment }         from '../../environments/environment';
import { AuthService }         from '../service/auth.service';
import { HttpService }         from '../service/http.service';
import { NotificationService } from '../service/notification.service';
import { PasswordValidation }  from '../core/password-validation';
import { AngularFire }         from "angularfire2";
import { SpinnerService }      from '../service/spinner.service';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
	selector: 'component-sign-up',
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
	error: string;
	customerPath: string;
	customerId: string;
	windowH: number;
	selectedCustomerIndex: number;

	isSaving: boolean;
	isGettingCustomers: boolean;

	USERTYPES:  any[];
	customers: Object[]; // all public customers' info

	signUpForm: FormGroup;
	formErrors: Object;
	validationMessages: Object;

	constructor(
		public _authService: AuthService,
		private _httpService: HttpService,
		private _nofication: NotificationService,
		private _router: Router,
		private _activeRoute: ActivatedRoute,
		private fb: FormBuilder,
		private _spinner: SpinnerService,
		private af: AngularFire
	) {
		this.USERTYPES = [
	    	{value: 'staff', display: 'Omniscent Staff'},
			{value: 'customer', display: 'Customer'}
	    ];

	    this.validationMessages = {
			email: {
				required: 'Email is required',
				pattern: 'Please enter a valid address'
			},
			password: {
				required: 'Password is required'
			},
			confirmPassword: {
				required: 'Confirm password is required',
				MatchPassword: 'Password not match'
			},
			type: {
				required: 'Type is required'	
			}
		};
		this.formErrors = {
			email: '',
			password: '',
			confirmPassword: '',
			type: ''
		};

	    this.customerId = null;
	    this.customers = [];
	    this.isGettingCustomers = false;
	    this.selectedCustomerIndex = -1;

	    // get all customers' uids
	    let url = environment.APIS.CUSTOMERPORTALS;
	    this._spinner.start();
		this._httpService.getAsList(url).subscribe(CustomerPortals => {
			this.customers = CustomerPortals;
			this.signUpForm = this.fb.group({
		        email: new FormControl('', [
		        		<any>Validators.required,
		        		<any>Validators.pattern(EMAIL_REGEX)
		        	]),
		        password: new FormControl('', [
		        		<any>Validators.required
		        	]),
		        confirmPassword: new FormControl('', [
		        		<any>Validators.required
		        	]),
		        type: new FormControl(this.USERTYPES[0]['value'], [
		        		<any>Validators.required
		        	]),
		        customerName: new FormControl(0, [
		        		<any>Validators.required
		        	])
		    }, {validator: PasswordValidation.MatchPassword});

		    this.signUpForm.valueChanges.subscribe(data => this.onValueChanged(data));
		    this._spinner.stop();
			this.isGettingCustomers = true;
		}, error => {
			console.log(error);
		});
	}

	ngOnInit() {
	    this.windowH = window.innerHeight;
	}
	// check the validation
	onValueChanged(data?: any) {
		if(!this.signUpForm) {return;}

		const form = this.signUpForm;
		for(const field in this.formErrors) {
			this.formErrors[field] = '';
			const control = form.get(field);

			if(control && control.dirty && !control.valid) {
				const messages = this.validationMessages[field];
				for(const key in control.errors) {
					this.formErrors[field] += messages[key] + ' ';
				}
			}
		}
	}

	getCustomerId(customerPath: string) {
		let query = {
			query: {
				orderByChild: 'path',
				equalTo: customerPath
			}
		};

		let url = environment.APIS.CUSTOMERPORTALS;
		this._httpService.getWithQuery(url, query).subscribe((customerData) => {
			console.log(customerData);
			this.customerId = (customerData[0] as any).name;
		}, error => {
			console.log(error);
		});
	}

	submitSignUp() {
		this._spinner.start();
		let creds = {
			email: this.signUpForm['value']['email'],
			password: this.signUpForm['value']['password']
		};
		this.af.auth.createUser(creds)
            .then(res => {
                if((res as any).provider === 4) {
					this.saveUser(res);
				}
            })
            .catch((error) => {
                console.error('Error fetching users', error);
                this._nofication.createNotification('error', 'Alert', error['message']);
                this._spinner.stop();
            });
	}

	// save the user to the user table 
	saveUser(user: any) {
		let type = this.signUpForm['value']['type'];
		let newUser: Object = {
			email: user['auth']['email']
		}

		if(type === this.USERTYPES[1]['value']) {
			let customerIndex = this.signUpForm['value']['customerName'];
			(newUser as any).customerId = this.customers[customerIndex]['$key'];
		}

		let url = environment.APIS.USERS;
		this._httpService.postAsObject(`${url}/${type}s/${user['uid']}/info`, newUser)
            .then(
                res  => {
                	this._spinner.stop();
                	this._nofication.createNotification('success', 'Sign up', 'Sign Up Successful!');
                	this._router.navigateByUrl('login');
                },
                error => {
                	this._spinner.stop();
                	console.error(error);
                });
	}

	// go to customer site
	gotoCustomerPage(path: string, index: number) {
		this._router.navigateByUrl(`${path}/sign_up`);
		this.selectedCustomerIndex = index;
	}
}
