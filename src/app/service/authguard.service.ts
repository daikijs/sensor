import { 
	Injectable,
	OnDestroy
} from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment }  from '../../environments/environment';
import { AuthService }  from './auth.service';
import { DataService }  from './data.service';
import { HttpService }  from './http.service';
import { EventService } from './event.service';

@Injectable()
export class AuthguardService implements CanActivate, OnDestroy {
	currentUser: any;
	userSub: any;

	customerPath: string;
	type: string;

	USER_TYPES = ['staff', 'customer'];

	constructor(
		private _authService: AuthService,
		private _dataService: DataService,
		private _httpService: HttpService,
		private _eventService: EventService,
		private _router: Router
	) {
		this._eventService.registerEvent('logout', this, (args: any) => {
			this.destroySubscribes();
		});
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		let that = this;
		let roles = route.data["roles"] as Array<string>;
		let types = route.data["types"] as Array<string>;
		let userRole = this._dataService.getString('user_role');
		this.customerPath = this._dataService.getString('customer_path');
		if(!this.customerPath) { // staff
			this.type = this.USER_TYPES[0];
		} else {
			this.type = this.USER_TYPES[1];
		}

		return this._authService.checkLoginStatus().then((res) => {
			if(res) {
				if(!roles && !types) {
					return true;
				} else {
					let result;
					let userUrl = environment.APIS.USERS;
					if(!this.customerPath) { // staff
						userUrl += '/staffs/'
					} else { // customer
						userUrl += '/customers/';
					}

					userUrl += (res as any).uid;

					let promiseResult: Promise<boolean> = new Promise((resolve, reject) => {
						this.destroySubscribes();
						
			            this.userSub = this._httpService.getAsObject(userUrl).subscribe(user => {

							if(user.hasOwnProperty('action') && user['action']['status'] === 'approved') { // approved
								if(roles) {
									if(roles.indexOf(userRole) > -1) {
										result = true;
									} else {
										this.gotoDashboard();
										resolve(false);
									}
								}

								if(types && result) {
									if(types.indexOf(this.type) > -1) {
										result = true;
									} else {
										this.gotoDashboard();
										resolve(false);
									}
								}

								resolve(result);
							} else {
								this.logout();
								resolve(false);
							}
						},
						error => {
							console.log(error);
							this.logout();
							resolve(false);
						});
			        });

			        return promiseResult;
				}
			} else {
				this.logout();
				return false;
			} 
		})
		.catch((ex) => {
		    console.error('Error fetching users', ex);
		    this.logout();
		    return false;
		});
	}

	ngOnDestroy() {

	}

	gotoDashboard() {
		if(!this.customerPath) {
			this._router.navigate(['/dashboard']);
		} else {
			this._router.navigate([`/${this.customerPath}/dashboard`]);
		}
	}

	destroySubscribes() {
		if(this.userSub) {
			this.userSub.unsubscribe();
		}
	}

	logout() {
		this.destroySubscribes();

		this._authService.logout().then(res => {
			this.gotoLogin();
		},
		error => {
			console.log(error);
			this.gotoLogin();
		});
	}

	gotoLogin() {
		this._router.navigate(['/login']);
	}
}
