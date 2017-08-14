import { Component,
	OnInit,
	OnDestroy
} from '@angular/core';
import { FormGroup,
	FormBuilder,
	Validators,
	FormControl
} from '@angular/forms';
import { environment }            from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService }            from '../service/data.service';
import { AuthService }            from '../service/auth.service';
import { HttpService }            from '../service/http.service';
import { SpinnerService }         from '../service/spinner.service';
import { NotificationService }    from '../service/notification.service';
import { AngularFire }            from "angularfire2";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
	uids: string[]; // all customers' uids

	isLoading: boolean;
	selectedCustomerIndex: number;
	customerPath: string;

	customerPortalSub: any;
	customerUsersSub: any;
	staffUsersSub: any;

	loginForm: FormGroup;
	formErrors: Object;
	validationMessages: Object;

	constructor(
		private _dataService: DataService,
		public _authService: AuthService,
		private _httpService: HttpService,
		private _spinner: SpinnerService,
		private _nofication: NotificationService,
		private _router: Router,
		private _activeRoute: ActivatedRoute,
		private af: AngularFire
	) {
		this.uids = [];
		this.selectedCustomerIndex = -1;
		this.customerPath = null;
		this.validationMessages = {
			email: {
				required: 'Email is required',
				pattern: 'Please enter a valid address'
			},
			password: {
				required: 'Password is required'
			}
		};
		this.formErrors = {
			email: '',
			password: ''
		};
	}

	ngOnInit() {
		this.checkLoginStatus();

		this.loginForm = new FormGroup({
	        email: new FormControl('', [
	        		<any>Validators.required,
	        		<any>Validators.pattern(EMAIL_REGEX)
	        	]),
	        password: new FormControl('', [
	        		<any>Validators.required
	        	])
	    });

	    this.loginForm.valueChanges.subscribe(data => this.onValueChanged(data));
	}

	// check the validation
	onValueChanged(data?: any) {
		if(!this.loginForm) {return;}

		const form = this.loginForm;
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

	ngOnDestroy() {
		if(this.customerPortalSub) {
			this.customerPortalSub.unsubscribe();
		}

		if(this.customerUsersSub) {
			this.customerUsersSub.unsubscribe();
		}

		if(this.staffUsersSub) {
			this.staffUsersSub.unsubscribe();
		}
	}

	submitLogin() {
		this.customerPath = null;
		let creds = {
			email: this.loginForm['value']['email'],
			password: this.loginForm['value']['password']
		};

		this._spinner.start();
        this.af.auth.login(creds, this._authService.config)
            .then(res => {
                if((res as any).provider === 4) {
                	/*===customer===*/
                	let userUrl = environment.APIS.USERS;
                    let userUid = (res as any).uid;
                    let bIsLogin = false;
                    let nLoginCount = 0;
					let customerUserSub = this._httpService.getAsObject(`${userUrl}/customers/${userUid}`).take(1).subscribe(user => {
						//customerUserSub.unsubscribe();
						if(!bIsLogin) { // user is not logined
							if(user['info']) {
								bIsLogin = true;
								let portalUrl = environment.APIS.CUSTOMERPORTALS;
								let portalSub = this._httpService.getAsObject(`${portalUrl}/${user['customerId']}`).subscribe(portal => {
									portalSub.unsubscribe();

									this.customerPath = portal['path'];
									this.checkUserStatus(user, false, portal['logo']);
								});
								
							} else {
								if(nLoginCount >= 1) {
									this._nofication.createNotification('error', 'Error', 'Your customer account is not existed');
									this.af.auth.logout();
									this._spinner.stop();
								}
							}
							nLoginCount ++;
						} else {
							console.log('User is already logined as a staff');
							this._spinner.stop();
						}
					},
					error => {
						this.af.auth.logout();
						this._spinner.stop();
						this._nofication.createNotification('error', 'Alert', "You can't login because of any error");
						console.log(error);
					});
                	/*===customer===*/

                	/*===staff===*/
					let staffUserSub = this._httpService.getAsObject(`${userUrl}/staffs/${userUid}`).take(1).subscribe(user => {
						if(!bIsLogin) {
							if(user['info']) {
								this.checkUserStatus(user);
							} else {
								if(nLoginCount >= 1) {
									this.af.auth.logout()
						                .then(result => {
						                	this._nofication.createNotification('error', 'Error', 'Your staff account is not existed');
											this._spinner.stop();
						                })
						                .catch(error => {
						                	console.log(error);
											this._nofication.createNotification('error', 'Error', 'Your staff account is not existed');	
											this._spinner.stop();
						                });
								}
							}
							nLoginCount ++;
						} else {
							console.log('User is already logined as a customer');
							this._spinner.stop();
						}
					},
					error => {
						this.af.auth.logout();
						this._spinner.stop();
						this._nofication.createNotification('error', 'Alert', "You can't login because of any error");
						console.log(error);
					});
                	/*===staff===*/
				}
            })
            .catch((error) => {
            	this._nofication.createNotification('error', 'Alert', error['message']);
                console.error('Error fetching users', error);
                this._spinner.stop();
            });
	}

	checkLoginStatus() {
		this.customerPath = null;
		let loginCount = 0;
		this._spinner.start();

		this._authService.checkLoginStatus().then((res) => {
			if(res) {
				console.log(res);
				let userUrl = environment.APIS.USERS;
				// customer case
				this.customerUsersSub = this._httpService.getAsObject(`${userUrl}/customers/${(res as any).uid}`).subscribe(user => {
					if(user['info']) {
						let portalUrl = environment.APIS.CUSTOMERPORTALS;
						let portalSub  = this._httpService.getAsObject(`${portalUrl}/${(user as any).customerId}`).subscribe(portal => {
							portalSub.unsubscribe();
							this.customerPath = portal['path'];
							this.checkUserStatus(user, true, portal['logo']);
						},
						error => {
							console.log(error);
							this._spinner.stop();
						});
					} else {
						if(loginCount >= 1) {
							this._spinner.stop();
							this._nofication.createNotification('error', 'Alert', "Your account isn't existed");
						}
					}
					loginCount ++;
				},
				error => {
					console.log(error);
					this._spinner.stop();
				});

				// staff case
				this.staffUsersSub = this._httpService.getAsObject(`${userUrl}/staffs/${(res as any).uid}`).subscribe(user => {console.log(user)
					if(user['info']) {
						this.checkUserStatus(user, true);
					} else {
						if(loginCount >= 1) {
							this._spinner.stop();
							this._nofication.createNotification('error', 'Alert', "Your account isn't existed");
						}
					}
					loginCount ++;
				},
				error => {
					console.log(error);
					this._spinner.stop();
				});
			} else {
				console.log('You need to sign up');
				this._spinner.stop();
			}
		});
	}

	// check the user status
	checkUserStatus(user: Object, isLogin: boolean = false, logo: string = '') {
		if(user.hasOwnProperty('action') && (user as any).action['status'] === 'approved') {

			this._dataService.saveString('user_role', (user as any).action['role']);

			if(this.customerPath) {
				if(logo && logo !== '') {
					this._dataService.saveString('site_logo', logo);
					this._router.navigateByUrl(`${this.customerPath}/dashboard`);
					this._spinner.stop();
				} else {
					let url = environment.APIS.STAFFINFO;
					let staffInfoSub = this._httpService.getAsObject(url).subscribe(staff => {
						staffInfoSub.unsubscribe();
						this._dataService.saveString('site_logo', (staff as any).logo);
						this._router.navigateByUrl(`${this.customerPath}/dashboard`);
						this._spinner.stop();
					},
					error => {
						this._spinner.stop();
						console.log(error);
					});	
				}
			} else {
				let url = environment.APIS.STAFFINFO;
				let staffInfoSub = this._httpService.getAsObject(url).subscribe(staff => {
					staffInfoSub.unsubscribe();
					this._dataService.saveString('site_logo', (staff as any).logo);
					this._router.navigateByUrl('dashboard');
					this._spinner.stop();
				},
				error => {
					this._spinner.stop();
					console.log(error);
				});
			}
			
			if(!isLogin) {
				if(this.customerPath) {
					this._dataService.saveString('customer_id', (user as any).info['customerId']);
					this._dataService.saveString('customer_path', this.customerPath);
				} else {
					this._dataService.saveString('customer_id', '');
					this._dataService.saveString('customer_path', '');
				}
				
				this._spinner.stop();
				this._nofication.createNotification('success', 'Login Success', 'Login Successful!');
			}
		} else {
			this.af.auth.logout()
                .then(result => {
                	this._spinner.stop();
					this._nofication.createNotification('info', 'Wait', 'Please wait until the admin approve!');
                })
                .catch(error => {
               		this._spinner.stop();
					console.log(error);
                });
		}
	}

	// go to customer site
	gotoCustomerPage(path: string, index: number) {
		this._router.navigateByUrl(`${path}/login`);
		this.selectedCustomerIndex = index;
	}
}
