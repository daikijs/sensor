import { Component,
	OnInit,
	OnChanges,
	Input,
	Output,
	EventEmitter,
	ViewContainerRef
} from '@angular/core';
import { CustomerModel,
	ZoneModel,
	SensorModel
} from '../../core/model';
import { Router,
	ActivatedRoute
} from '@angular/router';
import { environment }         from '../../../environments/environment';
import { NotificationService } from '../../service/notification.service';
import { ConfirmModalService } from '../../modal/confirm-modal/confirm-modal.service';
import { HttpService }         from '../../service/http.service';
import { DataService }         from '../../service/data.service';
import { Subject }             from 'rxjs/Subject';

@Component({
  selector: 'component-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, OnChanges {
	@Input() windowH: number;
	@Input() customers: any[];
	@Input() zones: any[];
	@Input() customerKey: string;
	@Input() zoneKey: string;
	@Input() sensorKey: string;
	@Input() sensorClickEvent: Subject<any>;
	@Output() raiseSensorEvent = new EventEmitter();

	selectedCustomId: number;
	selectedZoneId: number;
	selectedSensorId: number;

	userRole: string;

	bIsLoading: boolean;
	bIsSelectedCustomer: boolean;
	bIsSelectedZone: boolean;
	bIsSelectedSensor: boolean;

	bIsClearCustomer: boolean;
	bIsClearZone: boolean;
	bIsClearSensor: boolean;
	bIsEditable: boolean;

	selectedCustom: CustomerModel;
	selectedZone: Object;
	selectedSensor: Object;
	sensors: any[];
	focusZones: any[];
	isSensorStatus: boolean[];

	constructor(
		private _httpService: HttpService,
		private _dataService: DataService,
		private _confirmModalService: ConfirmModalService,
		private _viewContainerRef: ViewContainerRef,
		private _nofication: NotificationService,
		private _router: Router,
		private _activatedRoute: ActivatedRoute
	) {
		this.bIsLoading = true;
		this.bIsSelectedCustomer = false;
		this.bIsSelectedZone = false;
		this.bIsSelectedSensor = false;
		this.bIsClearCustomer = false;
		this.bIsClearZone = false;
		this.bIsClearSensor = false;
		this.bIsEditable = false;
		this.selectedCustomId = -1;
		this.userRole = this._dataService.getString('user_role');
	}

	ngOnInit() {
		//watch the sensor event clicked in map page
		this.sensorClickEvent.subscribe(event => {
			this._router.navigate(['/customer'], { queryParams: {
				type: 'list',
				customerId: event.customerKey,
				zoneId: event.zoneKey,
				sensorId: event.sensorKey
			} });
		});

		this.checkUserRole();
	}

	checkUserRole() {
		if(this.userRole === 'admin') {
			this.bIsEditable = true;
		} else {
			this.bIsEditable = false;
		}
	}

	ngOnChanges() {
		if(this.selectedCustomId > -1) {
			let that = this;
			// get all own zones of the customer selected
			this.focusZones = this.zones.filter(function(e) {
				return e.customerId === (that.selectedCustom as any).$key;
			});
		}

		this.preLoad(this.customerKey, this.zoneKey, this.sensorKey);
	}

	// preload the page with customer and zone key if existed
	preLoad(customerKey: string = null,
		zoneKey: string = null,
		sensorKey: string = null) {
		let customerIndex =  this.getIndexFromArray('customer', customerKey);
		if(customerIndex > -1) {
			this.gotoCustomer(customerIndex);
			let zoneIndex =  this.getIndexFromArray('zone', zoneKey);
			if(zoneIndex > -1) {
				this.gotoZone(zoneIndex);
				let sensorIndex = this.getIndexFromArray('sensor', sensorKey);
				if(sensorIndex > -1) {
					this.gotoSensor(sensorIndex);
				}
			}
		}
	}

	getIndexFromArray(type: string, key: string) {
		if(!key) {
			return -1;
		}

		let arr: any[];
		let that = this;
		switch (type) {
			case "customer":
				arr = that.customers;
				break;

			case "zone":
				arr = that.focusZones;
				break;

			case "sensor":
				arr = that.sensors;
				break;
		}

		for(let i=0; i<arr.length; i++) {
			if((arr[i] as any).$key === key) {
				return i;
			}
		}

		return -1;
	}

	// check all loading variable for get array data
	checkAllLoading(arr: boolean[]) {
		let returnData = false;
		let count = 0;

		for(let i=0; i<arr.length; i++) {
			if(arr[i]) {
				count ++;
			}
		}

		if(count >= (arr.length - 1)) {
			returnData = true;
		}

		return returnData;
	}

	clearZone() {
		// clear zone
		this.selectedZoneId = -1;
		this.selectedZone = {};
		this.bIsSelectedCustomer = false;
		this.bIsSelectedZone = false;
		this.bIsSelectedSensor = false;
		this.bIsClearCustomer = false;
	}

	selectCustomer(index: number) {
		this._router.navigate(['/customer'], { queryParams: {type: 'list', customerId: (this.customers[index] as any).$key} });
	}

	gotoCustomer(index: number) {
		this.clearZone();
		this.bIsClearCustomer = true;

		this.selectedCustomId = index;
		this.selectedCustom = this.customers[this.selectedCustomId];
		
		let that = this;
		// get all own zones
		this.focusZones = this.zones.filter(function(e) {
			return e.customerId === (that.selectedCustom as any).$key;
		});
		this.bIsSelectedCustomer = true;
	}

	clearSensor() {
		// clear sensor
		this.selectedSensorId = -1;
		this.selectedSensor = {};
		this.bIsSelectedZone = false;
		this.bIsSelectedSensor = false;
		this.bIsClearZone = false;
	}

	selectZone(index: number) {
		this._router.navigate(['/customer'], { queryParams: {type: 'list',
			customerId: (this.selectedCustom as any).$key,
			zoneId: (this.focusZones[index] as any).$key
		} });
	}

	gotoZone(index: number) {
		this.clearSensor();
		this.bIsClearZone = true;

		this.selectedZoneId = index;
		this.selectedZone = this.focusZones[index];
		this.sensors = (this.selectedZone as any).sensors;
		this.bIsSelectedZone = true;
	}

	selectSensor(index: number) {
		this._router.navigate(['/customer'], { queryParams: {type: 'list',
			customerId: (this.selectedCustom as any).$key,
			zoneId: (this.selectedZone as any).$key,
			sensorId: (this.sensors[index] as any).$key
		} });
	}

	gotoSensor(index: number) {
		this.selectedSensorId = index;
		this.selectedSensor = this.sensors[this.selectedSensorId];
		this.raiseSensorEvent.emit({lat: (this.selectedSensor as any).lat,
			lng: (this.selectedSensor as any).lng});
		this.bIsSelectedSensor = true;
	}

	deleteAction(type: string, key: string) {
		let url = null;
		let customerKey, zoneKey;
		switch (type) {
			case 'customer':
				url = environment.APIS.CUSTOMERS + '/';
				break;

			case 'zone':
				url = environment.APIS.ZONES + '/';
				customerKey = (this.selectedCustom as any).$key;
				break;

			case 'sensor':
				url = environment.APIS.SENSORS + '/';
				customerKey = (this.selectedCustom as any).$key;
				zoneKey = (this.selectedZone as any).$key;
				break;
		}

		if(url) {
			url += key;
		}

		this._httpService.deleteAsObject(url)
            .then(
                res  => {
                	console.log('Delete successfully: ' + url);
                },
                error =>  {
                	console.error(error);
                });
	}

	deleteCustomer(key: string) {
		let alertM = 'Are you sure to delete this customer? Its zones and sensors will be removed.';
		this._confirmModalService.openDialog(alertM, this._viewContainerRef)
			.then(dialog => {
				dialog.result.then(returnData => {
					if(returnData === 'agree') {
						this.deleteAction('customer', key);
						let url = environment.APIS.CUSTOMERPORTALS + '/';
						url += key;
						this._httpService.deleteAsObject(url)
				            .then(
				                res  => {
				                	console.log('Portal is deleted successfully!');
				                },
				                error =>  {
				                	console.error(error);
				                });
						
						for(let i=0; i<this.focusZones.length; i++) {
							let zone = this.focusZones[i];
							this.deleteAction('zone', (zone as any).$key);

							for(let j=0;j<(zone as any).sensors.length; j++) {
								let sensor = (zone as any).sensors[j];
								this.deleteAction('sensor', (sensor as any).$key);
							}
						}

					    this.clearZone();
					}
				});
			});
	}

	deleteZone(key: string) {
		let alertM = 'Are you sure to delete this zone? Its sensors will be removed.';
		this._confirmModalService.openDialog(alertM, this._viewContainerRef)
			.then(dialog => {
				dialog.result.then(returnData => {
					if(returnData === 'agree') {
						this.deleteAction('zone', key);

						for(let i=0;i<(this.selectedZone as any).sensors.length; i++) {
							let sensor = (this.selectedZone as any).sensors[i];
							this.deleteAction('sensor', (sensor as any).$key);
						}

					    this.clearSensor();
					}
				});

			});	
	}

	deleteSensor(key: string) {
		let alertM = 'Are you sure to delete this sensor?';
		this._confirmModalService.openDialog(alertM, this._viewContainerRef)
			.then(dialog => {
				dialog.result.then(returnData => {
					if(returnData === 'agree') {
						this.deleteAction('sensor', key);
						this.bIsSelectedSensor = false;
					} 
				});

			});
	}

	createCustomer() {
		this._router.navigateByUrl('create/newCustomer');
	}

	createZone() {
		let customerId = (this.selectedCustom as any).$key;
		this._router.navigate(['create/newZone'], {queryParams: {create: 'customer', customerId: customerId}});
	}

	createSensor() {
		let customerId = (this.selectedCustom as any).$key;
		let zoneId = (this.selectedZone as any).$key;
		this._router.navigate(['create/newSensor'], {queryParams: {create: 'customer', customerId: customerId, zoneId: zoneId}});
	}

}
