import { Component,
	OnInit,
	OnDestroy,
	OnChanges,
	ElementRef,
	ViewChild
} from '@angular/core';
import { environment }            from '../../environments/environment';
import { HttpService }            from '../service/http.service';
import { AuthService }            from '../service/auth.service';
import { DataService }            from '../service/data.service';
import { SpinnerService }         from '../service/spinner.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrls: ['./zone.component.scss']
})
export class ZoneComponent implements OnInit, OnChanges, OnDestroy {
	bIsMap: boolean;
	bIsLoading: boolean;
	bIsGettingZones: boolean;
	bIsGettingSensors: boolean;

	zones: any[];
	sensors: any[];

	status: number;
	nMAHeight: number;

	customerPath: string;
	customerId: string;
	zoneKey: string;
	sensorKey: string;

	sub: any;
	zoneSub: any;
	sensorSub: any;
	paramSub: any;

	focusCoordinate: Object;

	@ViewChild('zoneTopBarScreen') zoneTopBarScreen: ElementRef;
	@ViewChild('customerMAScreen') customerMAScreen: ElementRef;
	@ViewChild('zoneList') zoneList: ElementRef;

	constructor(
		private _router: Router,
		private _activeRoute: ActivatedRoute,
		private element: ElementRef,
		private _httpService: HttpService,
		private _authService: AuthService,
		private _dataService: DataService,
		private _spinner: SpinnerService
		) {
	}

	ngOnInit() {
		this.bIsMap = false;
		this.bIsGettingZones = false;
		this.bIsGettingSensors = false;
		this.status = 0;
		this.customerId = this._dataService.getString('customer_id');

		this.getData();

		this.sub = this._activeRoute.queryParams.subscribe(params => {
			if(params['type'] === 'list') {
				this.status = 1;
			} else {
				this.status = 0;
			}
			this.zoneKey   = params['zoneId'];
			this.sensorKey = params['sensorId'];
		});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
		this.destorySub();
	}

	ngOnChanges() {
		this.getData();
	}

	destorySub() {
		if(this.zoneSub) {
			this.zoneSub.unsubscribe();
		}

		if(this.sensorSub) {
			this.sensorSub.unsubscribe();
		}

		if(this.paramSub) {
			this.paramSub.unsubscribe();
		}
	}

	gotoSensorStatus(event: any) {
		if(!this.customerId) {
			this._router.navigate(['/zone'], { queryParams: {type: 'list', zoneId: event.zoneKey, sensorId: event.sensorKey} });
		} else {
			this._router.navigate([`/${this.customerId}/zone`], { queryParams: {type: 'list', zoneId: event.zoneKey, sensorId: event.sensorKey} });
		}
	}

	// get data from backend
	getData() {
		this._spinner.start();

		this.paramSub = this._activeRoute.params.subscribe(params => {
			this.destorySub();
			this.customerPath = params['customId'];
			this.bIsLoading = false;

			if(this.customerPath) { // customer case
				let query = {
					query: {
						orderByChild: 'customerId',
						equalTo: this.customerId
					}
				};

				let url = environment.APIS.ZONES;
				this.zoneSub = this._httpService.getWithQuery(url, query).subscribe(data => {
					this.zones = data;
					this.bIsGettingZones = true;
					this.checkLoad();
			    },
			    error => {
			    	console.log('You do not have permission for the Zones');
			    	console.log(error);
			    });

				url = environment.APIS.SENSORS;
			    this.sensorSub = this._httpService.getWithQuery(url, query).subscribe(data => {
					this.sensors = data;

					this.bIsGettingSensors = true;
					this.checkLoad();
			    },
			    error => {
			    	console.log('You do not have permission for the Sensors');
			    	console.log(error);
			    });
			} else { // staff case

				let url = environment.APIS.ZONES;
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
			}
		});
	}

	checkLoad() {
		let count = 0;
		if(this.bIsGettingZones) {
			count ++;
		}

		if(this.bIsGettingSensors) {
			count ++;
		}

		if(count >= 2) {
			this.zones = this.zones.map(item => {
				item.sensors = [];
				item.total = 0;
				item.offTotal = 0;
				return item;
			});

			this.makeZoneList();
			this.setMainHeight();
			this._spinner.stop();
			this.bIsLoading = true;
		}
	}

	//set the offTotal and total of the zone
	setZoneCount(zone: any) {
		for(let i=0; i<(zone as any).sensors.length; i++) {
			let sensor = (zone as any).sensors[i];
			(zone as any).total = (zone as any).total + 1 ;
			if((sensor as any).availability === 'off') {
				(zone as any).offTotal = (zone as any).offTotal + 1 ;
			}
		}
	}

	// put sensors to their zones
	makeZoneList() {
		for(let i=0; i<this.sensors.length; i++) {
			this.getZone(this.sensors[i]);
		}
	}

	// push the sensor to their zone
	getZone(sensor: Object) {
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
	}

	setMainHeight(count: number = 0) {
		if(count > 50) {
			console.log('Timeout!');
		} else if(!this.zoneTopBarScreen) {
			count ++;
			setTimeout(()=>this.setMainHeight(count), 50);
		} else {
			this.nMAHeight = this.customerMAScreen.nativeElement.offsetHeight - this.zoneTopBarScreen.nativeElement.offsetHeight;
			this.bIsMap = true;
		}
	}

	getTabEven(event: any) {
		if(event === 1) {
			if(!this.customerId) {
				this._router.navigate(['/zone'], { queryParams: {type: 'list'} });
			} else {
				this._router.navigate([`/${this.customerId}/zone`], { queryParams: {type: 'list'} });
			}
			
		} else {
			if(!this.customerId) {
				this._router.navigate(['/zone']);
			} else {
				this._router.navigate([`/${this.customerId}/zone`]);
			}
		}
	}

	getSensorEvent(event: any) {
		this.focusCoordinate = event;
	}

	loadPage(event: any) {
		if(event) {
			this._router.navigate(['/zone'], { queryParams: {type: 'list', zoneId: event} });
		} else {
			this._router.navigate(['/zone'], { queryParams: {type: 'list'} });
		}
	}

}
