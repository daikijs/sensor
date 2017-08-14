import { Component,
	OnInit,
	ViewChild,
	ElementRef
} from '@angular/core';
import { FormGroup,
	FormBuilder,
	Validators,
	FormControl
} from '@angular/forms';
import { environment }            from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService }            from '../../service/http.service';
import { DataService }            from '../../service/data.service';
import { NotificationService }    from '../../service/notification.service';
import { ColorPickerService } from 'angular2-color-picker';

const VALUE_KEYS = ['name', 'description', 'color', 'criticality'];

@Component({
	selector: 'app-zone-detail',
	templateUrl: './zone-detail.component.html',
	styleUrls: ['./zone-detail.component.scss']
})
export class ZoneDetailComponent implements OnInit {
	bIsPageLoading: boolean;
	bIsEditable: boolean;
	bIsTypeLoading: boolean;

	mainAreaHeight: number;
	status: number;
	sensorCounter: number;

	error: string;
	userRole: string;
	paramValue: string;

	sensorTypes: string[];

	currentZone: Object;

	CRITICALITIES = ['high', 'medium', 'low'];

	@ViewChild('logoArea') logoArea: ElementRef;

	constructor(
		private _httpService: HttpService,
		private _dataService: DataService,
		private _activeRoute: ActivatedRoute,
		private _nofication: NotificationService,
		private cpService: ColorPickerService
	) {
		this.status = 0; // 0: none, > 1: edit
		this.error = '';
		this.paramValue ='';
		this.userRole = this._dataService.getString('user_role');
		this.bIsTypeLoading = false;
	}

	ngOnInit() {
		
		this._activeRoute.params.subscribe(params => {
			let zoneKey = params['id'];
			let zoneUrl = environment.APIS.ZONES ;

			// get the zone
			this._httpService.getAsObject(`${zoneUrl}/${zoneKey}`).subscribe(zone => {
				this.currentZone = zone;
				this.bIsPageLoading = true;
				this.initElement();
			},
			error => {
				console.log(error);
			});

			// get sensors
			let query = {
				query: {
					orderByChild: 'zoneId',
					equalTo: zoneKey
				}
			};

			let sensorUrl = environment.APIS.SENSORS;
			this._httpService.getWithQuery(sensorUrl, query).subscribe((sensors) => {
				this.sensorCounter = sensors.length;
				let sensorTypes = sensors.map(item => {
					return item.sensorTypeId;
				});

				sensorTypes = sensorTypes.filter((item, index, self) => {
					return self.lastIndexOf(item) === index;
				});

				this.sensorTypes = [];
				let counter = 0;
				let sensortypeUrl = environment.APIS.SENSORTYPES;

				for(let i=0; i<sensorTypes.length; i++) {
					this._httpService.getAsObject(`${sensortypeUrl}/${sensorTypes[i]}`).subscribe((type) => {
						this.sensorTypes[i] = type.typeName;
						counter ++;
						if(sensorTypes.length <= counter) {
							this.bIsTypeLoading = true;
						}
					}, error => {
						console.log(error);
					});
				}

			}, error => {
				console.log(error);
			});
		});

		this.checkUserRole();
	}

	checkUserRole() {
		let userType = this._dataService.getString('customer_id');
		let roles = ['admin', 'debugger', 'operator'];
		if(!userType) { // staff
			if(roles.indexOf(this.userRole) > -1) {
				this.bIsEditable = true;
			} else {
				this.bIsEditable = false;
			}
		} else { // customer
			roles = ['admin', 'operator'];
			if(roles.indexOf(this.userRole) > -1) {
				this.bIsEditable = true;
			} else {
				this.bIsEditable = false;
			}
		}
		
	}

	initElement(counter: number = 0) {
		if(counter > 50) {
			console.log('Zone detail page is not loading');
		} else if(!this.logoArea) {
			counter ++;
			setTimeout(()=>this.initElement(counter), 50);
		} else {
			this.mainAreaHeight = window.innerHeight - this.logoArea.nativeElement.offsetHeight;
		}
	}

	/*
	update the values
	1: name
	2: description
	3: color
	*/
	editValue(index: number, value: string) {
		this.status = index;
		this.paramValue = value;
	}

	// update the value
	update() {
		let url = environment.APIS.ZONES;

		let updateValue = <any>{};
		updateValue[VALUE_KEYS[this.status-1]] = this.paramValue;
		console.log(updateValue);

		this._httpService.updateAsObject(`${url}/${(this.currentZone as any).$key}`, updateValue)
            .then(
                res  => {
                	this.clearEdit();
                	this._nofication.createNotification('success', 'Update', 'The zone param updated successful!');
                },
                error =>  console.error(error));
	}

	// cancel to edit
	cancel() {
		this.clearEdit();
	}

	clearEdit() {
		this.status = 0;
		this.paramValue = '';
		this.error = '';
	}

}
