import { Component,
	OnInit,
	OnChanges,
	OnDestroy,
	ElementRef,
	ViewChild
} from '@angular/core';
import { Router,
	ActivatedRoute
} from '@angular/router';
import { Subject }        from 'rxjs/Subject';
import { environment }    from '../../environments/environment';
import { HttpService }    from '../service/http.service';
import { AuthService }    from '../service/auth.service';
import { DataService }    from '../service/data.service';
import { SpinnerService } from '../service/spinner.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit, OnDestroy, OnChanges {
	status: number;
	sub: any;

	bIsLoading: boolean;
	bIsGettingCustomers: boolean;
	bIsGettingZones: boolean;
	bIsGettingSensors: boolean;
	bIsMap: boolean;

	nMAHeight: number;
	customers: any;
	zones: any[];
	sensors: any[];

	logUrl: string;
	customerKey: string;
	zoneKey: string;
	sensorKey: string;

	customerSub: any;
	zoneSub: any;
	sensorSub: any;

	focusCoordinate: Object;

	sensorClickEvent: Subject<any> = new Subject();

	@ViewChild('customerTopBarScreen') customerTopBarScreen: ElementRef;
	@ViewChild('customerMAScreen') customerMAScreen: ElementRef;
	@ViewChild('customerList') customerList: ElementRef;

	constructor(
		private _router: Router,
		private _activeRoute: ActivatedRoute,
		private element: ElementRef,
		private _dataService: DataService,
		private _authService: AuthService,
		private _httpService: HttpService,
		private _spinner: SpinnerService
	) {
		this.status = 1;
		this.bIsLoading = false;
		this.bIsGettingCustomers = false;
		this.bIsGettingZones = false;
		this.bIsGettingSensors = false;
		this.bIsMap = false;
		let userRole = this._dataService.getString('user_role');

		let url = environment.APIS.CUSTOMERS;
		this._spinner.start();

		this.customerSub = this._httpService.getAsList(url).subscribe(data => {
			this.customers = data;
			this.bIsGettingCustomers = true;
			this.checkLoad();
	    },
	    error => {
	    	console.log('You do not have permission for the Customers');
	    	console.log(error);
	    });

	    url = environment.APIS.ZONES;

	    this.zoneSub = this._httpService.getAsList(url).subscribe(data => {
			this.zones = data;
			this.bIsGettingZones = true;
			this.checkLoad();
	    },
	    error => {
	    	console.log('You do not have permission for the Zones');
	    	console.log(error);
	    });

	    url = environment.APIS.SENSORS;

	    this.sensorSub = this._httpService.getAsList(url).subscribe(data => {
			this.sensors = data;

			this.bIsGettingSensors = true;
			this.checkLoad();
	    },
	    error => {
	    	console.log('You do not have permission for the Sensors');
	    	console.log(error);
	    });

	    this.logUrl = this._dataService.getString('site_logo');
	}

	ngOnInit() {
		this.sub = this._activeRoute.queryParams.subscribe(params => {
			if(params['type'] === 'list') {
				this.status = 1;
			} else {
				this.status = 0;
			}
			this.customerKey = params['customerId'];
			this.zoneKey = params['zoneId'];
			this.sensorKey = params['sensorId'];
		});
	}

	ngOnChanges() {
		console.log('----------ngOnChanges');
	}

	ngOnDestroy() {
		if(this.sub) {
			this.sub.unsubscribe();	
		}

		if(this.customerSub) {
			this.customerSub.unsubscribe();	
		}

		if(this.zoneSub) {
			this.zoneSub.unsubscribe();	
		}

		if(this.sensorSub) {
			this.sensorSub.unsubscribe();	
		}
		
	}

	checkLoad() {
		let count = 0;
		if(this.bIsGettingCustomers) {
			count ++;
		}

		if(this.bIsGettingZones) {
			count ++;
		}

		if(this.bIsGettingSensors) {
			count ++;
		}

		if(count >= 3) {
			this.customers = this.customers.map(item => {
				item.total = 0;
				item.offTotal = 0;
				return item;
			});

			this.zones = this.zones.map(item => {
				item.sensors = [];
				item.total = 0;
				item.offTotal = 0;
				return item;
			});

			this.initZones();
			this.setMainHeight();
			this._spinner.stop();
			this.bIsLoading = true;
		}
	}

	getSensorEvent(event: any) {
		this.focusCoordinate = event;
	}

	/*
	- put sensors to their zones
	- init the offTotal and total counter of the zone
	*/
	initZones() {
		for(let i=0; i<this.sensors.length; i++) {
			this.putToZone(this.sensors[i]);
		}
	}

	// push the sensor to their zone
	putToZone(sensor: Object) {
		let filterZoneList = this.zones.filter(function(e) {
			return e.$key === (sensor as any).zoneId;
		});

		let filterZone = filterZoneList[0];
		if(filterZone && filterZone.hasOwnProperty('name')) {
			(filterZone as any).total = (filterZone as any).total + 1 ;
			if((sensor as any).availability === 'off') {
				(filterZone as any).offTotal = (filterZone as any).offTotal + 1 ;
			}
			filterZone.sensors.push(sensor);
		}

		let filterCustomerList = this.customers.filter(function(e) {
			return e.$key === (sensor as any).customerId;
		});

		let filterCustomer = filterCustomerList[0];
		if(filterCustomer && filterCustomer.hasOwnProperty('name')) {
			(filterCustomer as any).total = (filterCustomer as any).total + 1 ;
			if((sensor as any).availability === 'off') {
				(filterCustomer as any).offTotal = (filterCustomer as any).offTotal + 1 ;
			}
		}
	}

	setMainHeight(count: number = 0) {
		if(count > 100) {
			console.log('Timeout!');
		} else if(!this.customerTopBarScreen) {
			count ++;
			setTimeout(()=>this.setMainHeight(count), 50);
		} else {
			this.nMAHeight = this.customerMAScreen.nativeElement.offsetHeight - this.customerTopBarScreen.nativeElement.offsetHeight;
			this.bIsMap = true;
		}
	}

	getTabEven(event: any) {
		if(event === 1) {
			this._router.navigate(['/customer'], { queryParams: {type: 'list'} });
		} else {
			this._router.navigate(['/customer']);
		}
	}

	gotoSensorStatus(event: any) {
		this.status = 1;
		this.sendClickSensorEvent(event);
	}

	sendClickSensorEvent(event: any, count: number = 0) {
		if(count > 50) {
			console.log('Time out to load the list elements in customer page.');
		} else if(!this.customerList) {
			count ++;
			setTimeout(()=>this.sendClickSensorEvent(event, count), 50);
		} else {
			this.sensorClickEvent.next(event);
		}
	}

}
