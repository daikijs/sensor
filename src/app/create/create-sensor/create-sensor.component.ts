import { Component,
	Input,
	OnDestroy,
	OnInit } from '@angular/core';
import { FormGroup,
	FormBuilder,
	Validators,
	FormControl
} from '@angular/forms';
import { environment }         from '../../../environments/environment';
import { HttpService }         from '../../service/http.service';
import { NotificationService } from '../../service/notification.service';
import { SpinnerService }      from '../../service/spinner.service';
import { MapsAPILoader }       from 'angular2-google-maps/core';
import { Router }              from '@angular/router';
declare var google: any;

@Component({
  selector: 'component-create-sensor',
  templateUrl: './create-sensor.component.html',
  styleUrls: ['./create-sensor.component.scss']
})
export class CreateSensorComponent implements OnInit, OnDestroy {
	@Input() createName: string;
	@Input() customerId: string;
	@Input() zoneId: string;
	model: Object;

	customerTotal: number;
	customerOffCount: number;
	zoneTotal: number;
	zoneOffCount: number;
	geocoder: any;

	sensorTypeSub: any;

	isCreatingSensor: boolean;
	situation: boolean;
	isGettingData: boolean;

	CREATENAMES: string[];
	sensorTypes: Object[];

	sensorForm: FormGroup;

	formErrors: Object;

	validationMessages = {
		'name': {
			'required': 'Name is required.',
			'minlength': 'Name must be at least 2 characters long.',
			'maxlength': 'Name can not be more that 24 characters long.'
		}
	};

	constructor(
		private _httpService: HttpService,
		private _mapApiLoader: MapsAPILoader,
		private _nofication: NotificationService,
		private _spinner: SpinnerService,
		private _router: Router
	) {
		this.customerTotal = -1;
		this.customerOffCount = -1;
		this.zoneTotal = -1;
		this.zoneOffCount = -1;
		this.situation = false;
		this.CREATENAMES = ['customer', 'zone'];

		this.isGettingData = false;

		this.initModel();
		this.initData();
		
	}

	ngOnInit() {
	}

	ngOnDestroy() {
		this.sensorTypeSub.unsubscribe();
	}

	initModel() {
		this.formErrors = {
			name: ''
		};
		
		this.model = {
			address: '',
			name: '',
			description: '',
			customerId: '',
			zoneId: '',
			availability: "off",
			lat: '',
			lng: '',
			type: '',
			serialNumber: ''
		};

		this.sensorForm = new FormGroup({
	        name: new FormControl((this.model as any).name, [
	        		<any>Validators.required,
	        		<any>Validators.minLength(2),
	        		<any>Validators.maxLength(25)
	        	]),
	        type: new FormControl((this.model as any).type, <any>Validators.required),
	        description: new FormControl(),
	        situation: new FormControl(this.situation),
	        address: new FormControl(),
	        lat: new FormControl(),
	        lng: new FormControl(),
	        serialNumber: new FormControl()
	    });

	    this.sensorForm.valueChanges.subscribe(data => this.onValueChanged(data));
	}

	// get data from back end
	initData() {
		let url = environment.APIS.SENSORTYPES;
		this.sensorTypeSub = this._httpService.getAsList(url).subscribe(sensorTypes => {
			this.sensorTypes = sensorTypes.map(item => {
				let data = {
					name: item.typeName,
					key: item.$key
				};
				return data;
			});
			
			if(this.sensorTypes.length > 0) {
				(this.model as any).type = (this.sensorTypes[0] as any).key;
				this.isGettingData = true;
			} else {
				console.log('You need to create sensor type');
			}
			
	    },
	    error => {
	    	console.log(error);
	    });
	}

	// check the validation
	onValueChanged(data?: any) {
		if(!this.sensorForm) {return;}

		const form = this.sensorForm;
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

	save() {
		this._spinner.start();
		this.model = {
			actionStatus: -1,
			address: this.sensorForm.value.address,
			name: this.sensorForm.value.name,
			description: this.sensorForm.value.description,
			customerId: this.customerId,
			zoneId: this.zoneId,
			availability: "off",
			lat: this.sensorForm.value.lat,
			lng: this.sensorForm.value.lng,
			sensorTypeId: this.sensorForm.value.type,
			serialNumber: this.sensorForm.value.serialNumber,
			csvUrl: '',
			resVal: 0
		};

		this.isCreatingSensor = false;
		
		if(this.sensorForm.value.situation) {
			this.getLatitudeLongitude(this.showResult, this);
		} else {
			this.createNewSensor();
		}
	}

	showResult(result: any, that: any) {
		(that.model as any).lat = result.geometry.location.lat();
		(that.model as any).lng = result.geometry.location.lng();
		that.createNewSensor();
	}

	getLatitudeLongitude(callback, that) {
		let address = (that.model as any).address;
		if(address) {
			// If adress is not supplied, use default value 'Ferrol, Galicia, Spain'
		    address = address || 'Ferrol, Galicia, Spain';
		    // Initialize the Geocoder
		    this._mapApiLoader.load().then(() => {
		    	let geocoder = new google.maps.Geocoder();

		    	if (geocoder) {
			        geocoder.geocode({
			            'address': address
			        }, function (results, status) {
			            if (status == google.maps.GeocoderStatus.OK) {
			                callback(results[0], that);
			            }
			        });
			    }
		    });
		}
	}

	createNewSensor() {
		let url = environment.APIS.SENSORS;

		this._httpService.createAsList(url, this.model)
            .then(
                res  => {
                	this._nofication.createNotification('success', 'New Sensor', 'New Sensor is created successful!');
                	if(this.createName === this.CREATENAMES[0]) {
                		this._router.navigate(['/customer'], { queryParams: {type: 'list', customerId: this.customerId, zoneId: this.zoneId} });	
                	} else {
                		this._router.navigate(['/zone'], { queryParams: {type: 'list', zoneId: this.zoneId} });
                	}
                	this.isCreatingSensor = true;
                	this.initModel();
                	this._spinner.stop();
                },
                error =>  console.error(error));
	}
}
