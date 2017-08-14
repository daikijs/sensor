import { Component,
	OnInit,
	OnDestroy,
	ViewContainerRef,
	ViewChild,
	ElementRef
} from '@angular/core';
import { Router,
	ActivatedRoute
} from '@angular/router';
import { environment }         from '../../environments/environment';
import { DialogRef }           from 'angular2-modal';
import { DataService }         from '../service/data.service';
import { HttpService }         from '../service/http.service';
import { AuthService }         from '../service/auth.service';
import { EventService }        from '../service/event.service';
import { SpinnerService }      from '../service/spinner.service';
import { UserModalService }    from '../modal/user-modal/user-modal.service';
import { NotificationService } from '../service/notification.service';
import { ConfirmModalService } from '../modal/confirm-modal/confirm-modal.service';
import { ConfirmModalContext } from '../modal/confirm-modal/confirm-modal.context';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
	@ViewChild('navPanelElement') navPanelElement: ElementRef;
	@ViewChild('panelElement') panelElement: ElementRef;
	mainAreaH: number;
	nClickAccountNumber: number;
	nSelectedCustomerIndex: number;
	nMainPanelW: number;

	users: any[];
	staffs: any[];
	customers: any[];
	customerPortals: any[];
	uid: string;
	authUser: any;
	settings: Object;

	filterQuery: string;
	rowsOnPage: number;
	sortBy: string;
	sortOrder: string;

	isStaffLoading: boolean;
	isCustomerLoading: boolean;
	isAuthLoading: boolean;
	bIsPageLoading: boolean;
	bIsCustomer: boolean;
	bIsStaffCase: boolean;
	bIsCustomerOpen: boolean;

	customerPath: string;
	customerName: string;

	paramsSub: any;
	usersSub: any;
	portalSub: any;
	sPortalSub: any;

	constructor(
		private _dataService: DataService,
		private _httpService: HttpService,
		private _authService: AuthService,
		private _eventService: EventService,
		private _spinner: SpinnerService,
		private _userModalService: UserModalService,
		private _nofication: NotificationService,
		private _confirmModalService: ConfirmModalService,
		private _viewContainerRef: ViewContainerRef,
		private _router: Router,
		private _activeRoute: ActivatedRoute) {
		this.isStaffLoading = false;
		this.isCustomerLoading = false;
		this.isAuthLoading = false;
		this.bIsPageLoading = false;
		this.bIsCustomer = false;
		this.bIsStaffCase = false;
		this.bIsCustomerOpen = false;

		this.filterQuery = '';
		this.rowsOnPage = 10;
		this.sortBy = 'email';
		this.sortOrder = 'asc';

		this.nClickAccountNumber = -1;
		this.nSelectedCustomerIndex = -1;
	}

	ngOnInit() {
		this.customerPath = null;

		this._eventService.registerEvent('logout', this, (args: any) => {
			this.destroySubscribe();
		});

		this.paramsSub = this._activeRoute.params.subscribe(params => {
			this.customerPath = params['customId'];
			this.customers = [];
			this.staffs = [];
			this.customerPortals = [];
			this.isStaffLoading = false;
			this.isCustomerLoading = false;

			let customerId = this._dataService.getString('customer_id');
			let query = {
				query: {
					orderByChild: 'info/customerId',
					equalTo: customerId
				}
			};

			let userApi = environment.APIS.USERS;

			if(this.customerPath) { // customer case
				this._spinner.start();
				this.bIsStaffCase = false;
				let url = environment.APIS.USERS + '/';
				url += 'customers';
				this.usersSub = this._httpService.getWithQuery(url, query).subscribe((users) => {
					this.customers = users.map((item) => {
						if(!item.hasOwnProperty('action')) {
							item['action'] = <any>{};
							item['action']['status'] = 'pending';
						} else if(!item['action']['status']) {
							item['action']['status'] = 'pending';
						}
						return item;
					});
					this.isCustomerLoading = true;
					this.bIsPageLoading = true;
					this._spinner.stop();
				}, error => {
					console.log(error);
					this._router.navigateByUrl('dashboard');
				});
			} else { // staff case
				this._spinner.start();
				this.bIsStaffCase = true;
				this.usersSub = this._httpService.getAsList(`${userApi}/staffs`).subscribe((users) => {
					this.staffs = users.map((item) => {
						if(!item.hasOwnProperty('action')) {
							item['action'] = <any>{};
							item['action']['status'] = 'pending';
						} else if(!item['action']['status']) {
							item['action']['status'] = 'pending';
						}
						return item;
					});
					this.isStaffLoading = true;
					this.checkPageLoad();
				}, error => {
					console.log(error);
					this._router.navigateByUrl('dashboard');
				});

				// get customer list
				let customerPotalUrl = environment.APIS.CUSTOMERPORTALS;
				this.portalSub = this._httpService.getAsList(customerPotalUrl).subscribe((customerPortals) => {
					this.customerPortals = customerPortals;
					this.isCustomerLoading = true;
					this.checkPageLoad();
				}, error => {
					console.log(error);
					this._router.navigateByUrl('dashboard');
				});
			}

			this.setPanelEleSize();
		},
	    error => {
	    	console.log(error);
	    });
	}

	ngOnDestroy() {
		this.destroySubscribe();
	}

	setPanelEleSize(nCount: number = 0) {
		if(nCount > 100) {
			console.log('Fail to load panel elements');
		} else if(!this.panelElement || !this.navPanelElement) {
			nCount ++;
			setTimeout(() => this.setPanelEleSize(nCount), 100);
		} else {
			this.nMainPanelW = this.panelElement.nativeElement.offsetWidth - this.navPanelElement.nativeElement.offsetWidth;
		}
	}

	checkPageLoad() {
		if(this.isCustomerLoading && this.isStaffLoading) {
			this.bIsPageLoading = true;
			this._spinner.stop();
		}
	}

	destroySubscribe() {
		if(this.paramsSub) {
			this.paramsSub.unsubscribe();	
		}
		
		if(this.usersSub) {
			this.usersSub.unsubscribe();	
		}

		if(this.portalSub) {
			this.portalSub.unsubscribe();	
		}

		if(this.sPortalSub) {
			this.sPortalSub.unsubscribe();	
		}
	}

	// select customer portal
	selectCustomerPortal(index: number) {
		this.nSelectedCustomerIndex = index;
		this.checkShowCustomer();

		if(this.sPortalSub) {
			this.sPortalSub.unsubscribe();	
		}

		let customerId = (this.customerPortals[index] as any).$key;
		this.customerName = (this.customerPortals[index] as any).name;

		let query = {
			query: {
				orderByChild: 'info/customerId',
				equalTo: customerId
			}
		};

		let url = environment.APIS.USERS + '/';
		url += 'customers';
		this.sPortalSub = this._httpService.getWithQuery(url, query).subscribe((users) => {
			this.customers = users.map((item) => {
				if(!item.hasOwnProperty('action')) {
					item['action'] = <any>{};
					item['action']['status'] = 'pending';
				} else if(!item['action']['status']) {
					item['action']['status'] = 'pending';
				}
				return item;
			});
			this.isCustomerLoading = true;
			this.bIsPageLoading = true;
		}, error => {
			console.log(error);
			this._router.navigateByUrl('dashboard');
		});
	}

	checkShowCustomer() {
		if(this.nClickAccountNumber===1 && this.nSelectedCustomerIndex > -1) {
			this.bIsCustomer = true;
		} else {
			this.bIsCustomer = false;
		}
	}

	selectAccount(index: number, event: any) {
		this.nClickAccountNumber = index;
		this.customers = [];

		
		if(this.nClickAccountNumber === 0) {
			this.nSelectedCustomerIndex = -1;
			this.checkShowCustomer();
			this.bIsCustomerOpen = false;
		} else {
			if(!event.target.classList.contains('customer-menu-item')) {
				this.bIsCustomerOpen = this.bIsCustomerOpen ? false : true;
			}
		}
	}

	// edit the user
	editUser(type: string, selectedUser: any) {
		if(selectedUser) {
			this._userModalService.openDialog(selectedUser, 'edit', type, this._viewContainerRef);	
		}
	}

	// delete the user
	deleteUser(type: string, selectedUser: any) {
		if(selectedUser) {
			let alertM = 'Are you sure to delete the user?';
			this._confirmModalService.openDialog(alertM, this._viewContainerRef)
				.then((dialog:DialogRef<ConfirmModalContext>) => {				
					dialog.result.then(returnData => {
						if(returnData === 'agree') {
							let url;
							if(type === 'staff') {
								url = environment.APIS.USERS + '/';
								url += 'staffs/';
								url += (selectedUser as any).$key;
							} else {
								url = environment.APIS.USERS + '/';
								url += 'customers/';
								url += (selectedUser as any).$key;
							}

							this.deleteUserAction(url);
						}
					});
				});
		}
	}

	// action which delete the user 
	deleteUserAction(url: string) {
	    this._httpService.deleteAsObject(url)
            .then(
                res  => {
                	this._nofication.createNotification('success', 'Delete', 'Deleting the user Successful!');
                	this._authService.checkLoginStatus().then((result) => {
                		if(!result) {
                			this._router.navigateByUrl('login');
                		}
                	});
                },
                error =>  console.error(error));
	}

	approve(type: string, selectedUser: any, event: any) {
		if(selectedUser) {
			let alertM = 'Are you sure to edit this user status?';
			this._confirmModalService.openDialog(alertM, this._viewContainerRef)
				.then((dialog:DialogRef<ConfirmModalContext>) => {
					dialog.result.then(returnData => {
						if(returnData === 'agree') {
							let status;
							if(event) {
								status = 'approved';
							} else {
								status = 'pending';
							}

							let value = {
								status: status
							};

							let url;
							let typeName;
							url = environment.APIS.USERS + '/';

							if(type === 'staff') {
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
					                	this._nofication.createNotification('success', 'Alert', 'The status update successfully');
					                },
					                error =>  console.error(error));
						} else {

						}
					});

				});
		}
		
	}

}
