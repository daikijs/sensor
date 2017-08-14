import { Component,
	OnInit,
	OnDestroy,
	ViewChild,
	ElementRef
} from '@angular/core';
import { environment }            from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService }            from '../../service/http.service';
import { DataService }            from '../../service/data.service';
import { NotificationService }    from '../../service/notification.service';
import { ColorPickerService }     from 'angular2-color-picker';
import { AngularFire }            from 'angularfire2';
import * as firebase              from 'firebase';

@Component({
	selector: 'app-customer-detail',
	templateUrl: './customer-detail.component.html',
	styleUrls: ['./customer-detail.component.scss']
})
export class CustomerDetailComponent implements OnInit, OnDestroy {

	bIsPageLoading: boolean;
	bIsEditable: boolean;
	bIsPortalLoading: boolean;
	uploadFlag: boolean;

	mainAreaHeight: number;
	status: number;

	error: string;
	userRole: string;
	paramValue: string;

	currentCustomer: Object;
	customerPortal: Object;
	paramObject: Object;

	customerSub: any;
	portalSub: any;

	PARAM_MAP = [
		['name'],
		['industry'],
		['address'],
		['email'],
		['color'],
		['date'],
		['contact1', 'firstName'],
		['contact1', 'lastName'],
		['contact1', 'email'],
		['contact1', 'phoneNumber'],
		['contact2', 'firstName'],
		['contact2', 'lastName'],
		['contact2', 'email'],
		['contact2', 'phoneNumber'],
		['emergencyContact', 'firstName'],
		['emergencyContact', 'lastName'],
		['emergencyContact', 'email'],
		['emergencyContact', 'phoneNumber']
	];

	PORTAL_PARAM_MAP = [
		'name',
		'logo'
	];

	INDUSTRY_OPTIONS = [
		'Air Quality Mg',
		'Law enforcement',
		'Instrumentation',
		'PetroChemical ',
		'Military '
	];

	@ViewChild('logoArea') logoArea: ElementRef;

	constructor(
		private _httpService: HttpService,
		private _dataService: DataService,
		private _activeRoute: ActivatedRoute,
		private _nofication: NotificationService,
		private cpService: ColorPickerService,
		private af: AngularFire
	) {
		this.status = 0; // 0: none, 1>: edit
		this.uploadFlag = false; // upload the logo with the file
		this.bIsEditable = false;
		this.bIsPortalLoading = false;
		this.userRole = this._dataService.getString('user_role');
	}

	ngOnInit() {
		
		this._activeRoute.params.subscribe(params => {
			let customerKey = params['id'];
			let customerUrl = environment.APIS.CUSTOMERS ;
			this.customerSub = this._httpService.getAsObject(`${customerUrl}/${customerKey}`).subscribe(customer => {
				this.currentCustomer = customer;
				this.bIsPageLoading = true;
				this.initElement();
				console.log(customer);
			},
			error => {
				console.log(error);
			});

			let portalUrl = environment.APIS.CUSTOMERPORTALS;
			this.portalSub = this._httpService.getAsObject(`${portalUrl}/${customerKey}`).subscribe(customerPortal => {
				this.customerPortal = customerPortal;
				this.bIsPortalLoading = true;
			},
			error => {
				console.log(error);
			});
		});

		this.checkUserRole();
	}

	ngOnDestroy() {
		if(this.customerSub) {
			this.customerSub.unsubscribe();
		}

		if(this.portalSub) {
			this.portalSub.unsubscribe();
		}
	}

	checkUserRole() {
		if(this.userRole === 'admin') {
			this.bIsEditable = true;
		} else {
			this.bIsEditable = false;
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

	getCurrentTime() {
		let today = new Date();
		let dd = today.getDate();
		let mm = today.getMonth()+1; //January is 0!
		let yyyy = today.getFullYear();
		let currentDay, d, m, yy;

		yy = yyyy.toString();
		d = dd.toString();
		m = mm.toString();

		if(dd<10) {
		    d='0'+dd.toString();
		} 


		if(mm<10) {
		    m='0'+mm.toString();
		}

		currentDay = m+'/'+d+'/'+yy;
		return currentDay;
	}

	/*
	update the values
	1: name
	2: industry
	3: address
	4: email
	5: color
	6: date
	7: contact1 first name
	8: contact1 last name
	9: contact1 email
	10: contact1 phone number
	11: contact2 first name
	12: contact2 last name
	13: contact2 email
	14: contact2 phone number
	15: emergency contact first name
	16: emergency contact last name
	17: emergency contact email
	18: emergency contact phone number
	*/

	editValue(index: number) {
		this.status = index;
		if(this.status < 19) {
			if(this.PARAM_MAP[this.status-1].length === 1) {
				this.paramValue = this.currentCustomer[this.PARAM_MAP[this.status-1][0]];	
			} else {
				if(this.currentCustomer[this.PARAM_MAP[this.status-1][0]]) {
					this.paramValue = this.currentCustomer[this.PARAM_MAP[this.status-1][0]][this.PARAM_MAP[this.status-1][1]];
				} else {
					this.paramValue = '';
				}
			}
		} else {
			this.paramValue = this.customerPortal[this.PORTAL_PARAM_MAP[this.status-18]];
		}
	}

	// update the value
	update() {
		let url = environment.APIS.CUSTOMERS;
		let updateValue = <any>{};

		if(this.PARAM_MAP[this.status-1].length === 1) {
			updateValue[this.PARAM_MAP[this.status-1][0]] = this.paramValue;

			this._httpService.updateAsObject(`${url}/${(this.currentCustomer as any).$key}`, updateValue)
	            .then(
	                res  => {
	                	this.clearEdit();
	                	this._nofication.createNotification('success', 'Update', 'The customer param updated successful!');
	                },
                error =>  console.error(error));

            if(this.status === 1) {
            	this.updateCustomerPortal(0);
            }
		} else {
			let objectKey = this.PARAM_MAP[this.status-1][0];
			updateValue[this.PARAM_MAP[this.status-1][1]] = this.paramValue;

			this._httpService.updateAsObject(`${url}/${(this.currentCustomer as any).$key}/${objectKey}`, updateValue)
	            .then(
	                res  => {
	                	this.clearEdit();
	                	this._nofication.createNotification('success', 'Update', 'The customer param updated successful!');
	                },
                error =>  console.error(error));
		}
	}

	updatePortal() {
		if(this.uploadFlag) { // upload with the url
			this.updateCustomerPortal(1);
		} else { // upload with the file
			this.upload();
		}
	}

	updateCustomerPortal(index: number) {
		console.log(this.paramValue);
		let portalUrl = environment.APIS.CUSTOMERPORTALS;
    	let portalValue = <any>{};
    	portalValue[this.PORTAL_PARAM_MAP[index]] = this.paramValue;

    	this._httpService.updateAsObject(`${portalUrl}/${(this.currentCustomer as any).$key}`, portalValue)
            .then(
                res  => {
                	this.clearEdit();
                	this._nofication.createNotification('success', 'Update', 'The portal param updated successful!');
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

	onChangeIndustry(value: string) {
		this.paramValue = value;
	}

	upload() {
        //Create a root reference
        let storageRef = firebase.storage().ref();
        let success = false;
        let fileID = 'logo_file_upload';
        let fileFolder = environment.Upload.logoFolder;
        if((<HTMLInputElement>document.getElementById(fileID)).value === '') {
            alert('Please select the upload file!');
            return;
        }
        // This currently only grabs item 0, TODO refactor it to grab them all
        for (let selectedFile of [(<HTMLInputElement>document.getElementById(fileID)).files[0]]) {
            // Make local copies of services because "this" will be clobbered
            let af = this.af;
            let timestamp = new Date().getTime().toString();
            let filename;
            filename = timestamp + '_' + selectedFile.name;console.log(filename);
            let path = `/${fileFolder}/${filename}`;
            var iRef = storageRef.child(path);
            iRef.put(selectedFile).then((snapshot) => {
                console.log('Uploaded a blob or file! Now storing the reference at',`/${fileFolder}/images/`);
                storageRef.child(path).getDownloadURL().then(url => {
                	this.paramValue = url;
                	this.updateCustomerPortal(1);
                });
            });
        }
    }

}
