import { Component,
	OnInit,
	OnChanges,
	Input,
	Output,
	EventEmitter,
	ViewContainerRef
} from '@angular/core';
import { Router,
	ActivatedRoute }           from '@angular/router';
import { environment }         from '../../../environments/environment';
import { HttpService }         from '../../service/http.service';
import { DataService }         from '../../service/data.service';
import { NotificationService } from '../../service/notification.service';
import { ConfirmModalService } from '../../modal/confirm-modal/confirm-modal.service';
import { ZoneModel, SensorModel } from '../../core/model';


@Component({
  selector: 'component-zone-list',
  templateUrl: './zone-list.component.html',
  styleUrls: ['./zone-list.component.scss']
})
export class ZoneListComponent implements OnInit, OnChanges {
	@Input() zones: Object[];
	@Input() zoneKey: string;
	@Input() sensorKey: string;
	@Output() loadPage = new EventEmitter();
	@Output() raiseSensorEvent = new EventEmitter();

	selectedCustomId: number;
	selectedZoneId: number;
	selectedSensorId: number;

	bIsSelectedZone: boolean;
	bIsSelectedSensor: boolean;
	bIsClearZone: boolean;
	bIsZoneEditatble: boolean;
	bIsSensorEditable: boolean;

	customerPath: string;

	selectedZone: Object;
	selectedSensor: Object;
	sensors: Object[];

	constructor(
		private _httpService: HttpService,
		private _dataService: DataService,
		private _nofication: NotificationService,
		private _viewContainerRef: ViewContainerRef,
		private _confirmModalService: ConfirmModalService,
		private _router: Router,
		private _activeRoute: ActivatedRoute
	) {
		this.bIsSelectedZone = false;
		this.bIsSelectedSensor = false;
		this.bIsClearZone = false;
		this.bIsZoneEditatble = false;
		this.bIsSensorEditable = false;
		this.selectedCustomId = -1;
	}

	ngOnInit() {
		this.preload(this.zoneKey, this.sensorKey);
	}

	ngOnChanges() {
		this.preload(this.zoneKey, this.sensorKey);	
	}

	checkUserRole() {
		let userRole = this._dataService.getString('user_role');
		
		this._activeRoute.params.subscribe(params => {
			this.customerPath = params['customId'];

			if(this.customerPath) { // customer case
				if(userRole === 'admin' || userRole === 'operator') {
					this.bIsZoneEditatble = true;
					this.bIsSensorEditable = true;
				} else {
					this.bIsZoneEditatble = false;
					this.bIsSensorEditable = false;
				}
			} else { // staff case
				let roles = ['admin', 'debugger', 'operator'];
				if(roles.indexOf(userRole) > -1) {
					this.bIsZoneEditatble = true;
					this.bIsSensorEditable = true;
				} else {
					this.bIsZoneEditatble = false;
					this.bIsSensorEditable = false;
				}
			}
		});				
	}

	//preload with the zone key
	preload(zoneKey: string=null, sensorKey: string=null) {
		this.checkUserRole();

		let zoneIndex =  this.getIndexFromArray('zone', zoneKey);
		if(zoneIndex > -1) {
			this.gotoZone(zoneIndex);
			let sensorIndex = this.getIndexFromArray('sensor', sensorKey);
			if(sensorIndex > -1) {
				this.gotoSensor(sensorIndex);
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
			case "zone":
				arr = that.zones;
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

	clearSensor() {
		// clear sensor
		this.selectedSensorId = -1;
		this.selectedSensor = {};
		this.bIsSelectedZone = false;
		this.bIsSelectedSensor = false;
		this.bIsClearZone = false;
	}

	selectZone(index: number) {
		if(!this.customerPath) {
			this._router.navigate(['/zone'], { queryParams: {type: 'list',
				zoneId: (this.zones[index] as any).$key
			} });
		} else {
			this._router.navigate([`/${this.customerPath}/zone`], { queryParams: {type: 'list',
				zoneId: (this.zones[index] as any).$key
			} });
		}
	}

	gotoZone(index: number) {
		this.clearSensor();
		this.bIsClearZone = true;

		this.selectedZoneId = index;
		this.selectedZone = this.zones[index];
		this.sensors = (this.selectedZone as any).sensors;
		this.bIsSelectedZone = true;
	}

	selectSensor(index: number) {
		this._router.navigate(['/zone'], { queryParams: {type: 'list',
			zoneId: (this.selectedZone as any).$key,
			sensorId: (this.sensors[index] as any).$key
		} });
		if(!this.customerPath) {
			this._router.navigate(['/zone'], { queryParams: {type: 'list',
				zoneId: (this.selectedZone as any).$key,
				sensorId: (this.sensors[index] as any).$key
			} });
		} else {
			this._router.navigate([`/${this.customerPath}/zone`], { queryParams: {type: 'list',
				zoneId: (this.selectedZone as any).$key,
				sensorId: (this.sensors[index] as any).$key
			} });
		}
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
			case 'zone':
				url = environment.APIS.ZONES + '/';
				customerKey = (this.selectedZone as any).customerId;
				break;

			case 'sensor':
				url = environment.APIS.SENSORS + '/';
				customerKey = (this.selectedZone as any).customerId;
				zoneKey = (this.selectedZone as any).$key;
				break;
		}

		if(url) {
			url += key;
		}
		console.log(url);
		this._httpService.deleteAsObject(url)
            .then(
                res  => {
                	console.log('Delete successfully: ' + url);
                	switch (type) {
						case 'zone':
							this.loadPage.emit(null);
							break;

						case 'sensor':
							this.preload((this.selectedZone as any).$key);
							break;
					}
                },
                error =>  {
                	console.error(error);
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

	createZone() {
		if(this.customerPath) {
			let customerId = this._dataService.getString('customer_id');
			this._router.navigate(['create/newZone'], {queryParams: {customerId: customerId}});
		} else {
			this._nofication.createNotification('alert', 'Alert', 'Customers can create their zone here. If you want, please go to customer page to create.');	
		}
		
	}

	createSensor() {
		let customerId = (this.selectedZone as any).customerId;
		let zoneId = (this.selectedZone as any).$key;
		this._router.navigate(['create/newSensor'], {queryParams: {customerId: customerId, zoneId: zoneId}});
	}
}
