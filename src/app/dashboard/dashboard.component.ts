import { 
    Component,
    OnInit,
    ElementRef
} from '@angular/core';
import { environment }            from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService }            from '../service/auth.service';
import { HttpService }            from '../service/http.service';
import { DataService }            from '../service/data.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    isLoading: boolean;
    isAdmin: boolean;

    userType: string;
    userRole: string;
    customerPath: string;

    userSub: any;

    constructor(
        private _authService: AuthService,
        private _httpService: HttpService,
        private _dataService: DataService,
        private element: ElementRef,
  		private router: Router,
        private _activeRoute: ActivatedRoute
    ) {
        this.isLoading = false;
        this.isAdmin = false;
        this.userType = '';
        this.userRole = this._dataService.getString('user_role');
    }

  	ngOnInit() {
        this.customerPath = null;

        this._activeRoute.params.subscribe(params => {
            this.customerPath = params['customId'];
            
            this._authService.checkLoginStatus().then((res) => {
                if(!res) {
                    this.router.navigateByUrl('login');
                } else {
                    if(this.customerPath) { // customer case
                        let url = environment.APIS.USERS + '/';
                        url += 'customers/';
                        url += (res as any).uid;
                        this.userSub = this._httpService.getAsObject(url).subscribe(user => {
                            if(user['info']['email'] && user['action']['status'] === 'approved') {
                                this.checkUserStatus(user);
                                this.userType = 'customer';
                                this.isLoading = true;
                            } else {
                                this._authService.logout().then(res => {
                                    this.router.navigateByUrl('login');  
                                });
                            }
                        },
                        error => {
                            console.log(error);
                            this._authService.logout().then(res => {
                                this.router.navigateByUrl('login');  
                            });
                        });
                    } else { // staff case
                        let url = environment.APIS.USERS + '/';
                        url += 'staffs/';
                        url += (res as any).uid;
                        this.userSub = this._httpService.getAsObject(url).subscribe(user => {
                            if(user['info'] && user['action']) {
                                this.checkUserStatus(user);
                                this.userType = 'staff';
                                this.isLoading = true;
                            } else {
                                this._authService.logout().then(res => {
                                    this.router.navigateByUrl('login');  
                                });
                            }
                        },
                        error => {
                            console.log(error);
                            this._authService.logout().then(res => {
                                this.router.navigateByUrl('login');
                            });
                        }); 
                    }
                }
            });
        });
  	}

    ngOnDestroy() {
        if(this.userSub) {
            this.userSub.unsubscribe();    
        }
    }

    // check the user status
    checkUserStatus(user: Object) {
        if((user as any).action['role'] === 'admin') {
            this.isAdmin = true;
        } else {
            this.isAdmin = false;
        }
    }

  	gotoCustomer() {
        this.router.navigateByUrl('customer');  
  	}

  	gotoZone() {
        if(this.customerPath) {
            this.router.navigateByUrl(`${this.customerPath}/zone`);
        } else {
            this.router.navigateByUrl('zone');    
        }
  	}

    gotoSensorType() {
        if(this.customerPath) {
            this.router.navigateByUrl(`${this.customerPath}/sensor_type`);
        } else {
            this.router.navigateByUrl('sensor_type');    
        }
    }

    gotoAdmin() {
        if(this.customerPath) {
            this.router.navigateByUrl(`${this.customerPath}/admin`);
        } else {
            this.router.navigateByUrl('admin');    
        }
    }

}
