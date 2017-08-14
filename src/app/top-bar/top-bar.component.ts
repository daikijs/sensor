import { Component, OnInit }      from '@angular/core';
import { Location }               from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService }            from '../service/auth.service';
import { HttpService }            from '../service/http.service';
import { DataService }            from '../service/data.service';
import { EventService }           from '../service/event.service';

@Component({
	selector: 'component-top-bar',
	templateUrl: './top-bar.component.html',
	styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
	bIsLogin: boolean;
	customerPath: string;
	logoUrl: string;

	constructor(
		private router: Router,
		private _authService: AuthService,
		private _httpService: HttpService,
		private _dataService: DataService,
		private _activeRoute: ActivatedRoute,
		private _location: Location,
		private _eventService: EventService
	) {
		this.bIsLogin = false;
		this.customerPath = null;

		let that = this;
		this.router.events.subscribe(() => {
			that.checkLoginStatus();
		});
	}

  	ngOnInit() {
  	}

  	logoout() {
  		this._eventService.emit('logout');
  		this._authService.logout().then(res => {
			this.router.navigateByUrl('login');	
		});
  	}

  	gotoDashboard() {
  		if(this.customerPath && this.customerPath !== 'undefined') {
  			this.router.navigateByUrl(`${this.customerPath}/dashboard`);	
  		} else {
  			this.router.navigateByUrl('dashboard');	
  		}
  	}

  	back() {
  		this._location.back();
  	}

  	checkLoginStatus() {
  		this.bIsLogin = false;
  		let that = this;

  		this._authService.checkLoginStatus().then((res) => {
			if(res) {
				this.customerPath = this._dataService.getString('customer_path');
				this.logoUrl = this._dataService.getString('site_logo');
				this.bIsLogin = true;
			} else {
				this.bIsLogin = false;
			}
		});
  	}
}
