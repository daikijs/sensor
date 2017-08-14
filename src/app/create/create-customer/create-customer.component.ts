import { Component,
	OnInit,
	OnDestroy,
	Input
} from '@angular/core';
import { Router,
	ActivatedRoute
} from '@angular/router';
import { FormGroup,
	FormBuilder,
	Validators,
	FormControl
} from '@angular/forms';
import { environment }         from '../../../environments/environment';
import { ContactModel }        from '../../core/model';
import { HttpService }         from '../../service/http.service';
import { NotificationService } from '../../service/notification.service';
import { AngularFire }         from 'angularfire2';
import * as firebase from 'firebase';

interface Image {
	path: string;
	filename: string;
	downloadURL?: string;
	$key?: string;
}

@Component({
  selector: 'component-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.scss']
})
export class CreateCustomerComponent implements OnInit, OnDestroy {
	@Input() windowH: number;
	model: Object;

	customerKey: string;
	customerPortalValue: Object;

	isLoading: boolean;
	isCreateCustomer: boolean;
	isUploadOption: boolean; // true: upload with url, false: upload with file

	pathNames: string[];
	preDefinedNames: string[];

	portalSub: any;

	INDUSTRY_OPTIONS = [
		'Air Quality Mg',
		'Law enforcement',
		'Instrumentation',
		'PetroChemical ',
		'Military '
	];

	customerForm: FormGroup;

	formErrors: Object;

	validationMessages = {
		'name': {
			'required': 'Name is required.',
			'minlength': 'Name must be at least 2 characters long.',
			'maxlength': 'Name can not be more that 24 characters long.'
		},
		'address': {
			'required': 'Name is required.',
			'minlength': 'Name must be at least 2 characters long.',
			'maxlength': 'Name can not be more that 24 characters long.'
		},
		'path': {
			'required': 'Name is required.',
			'minlength': 'Name must be at least 2 characters long.',
			'maxlength': 'Name can not be more that 24 characters long.'
		}
	};

	constructor(private _httpService: HttpService,
		private _nofication: NotificationService,
		private af: AngularFire,
		private _router: Router) {
		this.isLoading = false;
		this.isCreateCustomer = false;
		this.isUploadOption = true;
		this.pathNames = [];
		this.preDefinedNames = ['create'];
		let url = '';

		this.model = {
			name: '',
			address: '',
			industry: '',
			email: '',
			date: '',
			logo: '',
			path: '',
			contact1: {
				firstName: '',
				lastName: '',
				email: '',
				phoneNumber: ''
			},
			contact2: {
				firstName: '',
				lastName: '',
				email: '',
				phoneNumber: ''
			},
			emergencyContact: {
				firstName: '',
				lastName: '',
				email: '',
				phoneNumber: ''
			},
			color: ''
		};

		// get all customers' uids
		this.portalSub = this._httpService.getAsList(environment.APIS.CUSTOMERPORTALS).subscribe(CustomerPortals => {
	    	this.pathNames = CustomerPortals.map(element => {
	    		return element.path;
			});
			this.isLoading = true;
		}, error => {
			console.log(error);
		});
	}

	ngOnInit() {
		this.formErrors = {
			name: '',
			address: '',
			path: ''
		};

		this.customerForm = new FormGroup({
	        name: new FormControl((this.model as any).name, [
	        		<any>Validators.required,
	        		<any>Validators.minLength(2),
	        		<any>Validators.maxLength(25)
	        	]),
	        industry: new FormControl((this.model as any).industry, [
	        		<any>Validators.required
	        	]),
	        address: new FormControl((this.model as any).name, [
	        		<any>Validators.required,
	        		<any>Validators.minLength(2),
	        		<any>Validators.maxLength(25)
	        	]),
	        path: new FormControl((this.model as any).name, [
	        		<any>Validators.required,
	        		<any>Validators.minLength(2),
	        		<any>Validators.maxLength(25)
	        	]),
	        uploadOption: new FormControl(this.isUploadOption, []),
	        logo: new FormControl(),
	        email: new FormControl(),
	        date: new FormControl(),
	        c1FirstName: new FormControl(),
	        c1LastName: new FormControl(),
	        c1Email: new FormControl(),
	        c1PhoneNumber: new FormControl(),
	        c2FirstName: new FormControl(),
	        c2LastName: new FormControl(),
	        c2Email: new FormControl(),
	        c2PhoneNumber: new FormControl(),
	        eFirstName: new FormControl(),
	        eLastName: new FormControl(),
	        eEmail: new FormControl(),
	        ePhoneNumber: new FormControl()
	    });

	    this.customerForm.valueChanges.subscribe(data => this.onValueChanged(data));
	}

	ngOnDestroy() {
		this.portalSub.unsubscribe();
	}

	// check the validation
	onValueChanged(data?: any) {
		if(!this.customerForm) {return;}

		const form = this.customerForm;
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

	// generate random color
	makeRandomColor(){
		return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
	}

	save() {
		console.log(this.customerForm.value);
		this.model = {
			name: this.customerForm.value.name,
			industry: this.customerForm.value.industry,
			address: this.customerForm.value.address,
			email: this.customerForm.value.email,
			date: this.customerForm.value.date,
			logo: this.customerForm.value.logo,
			path: this.customerForm.value.path,
			contact1: {
				firstName: this.customerForm.value.c1FirstName,
				lastName: this.customerForm.value.c1LastName,
				email: this.customerForm.value.c1Email,
				phoneNumber: this.customerForm.value.c1PhoneNumber
			},
			contact2: {
				firstName: this.customerForm.value.c2FirstName,
				lastName: this.customerForm.value.c2LastName,
				email: this.customerForm.value.c2Email,
				phoneNumber: this.customerForm.value.c2PhoneNumber
			},
			emergencyContact: {
				firstName: this.customerForm.value.eFirstName,
				lastName: this.customerForm.value.eLastName,
				email: this.customerForm.value.eEmail,
				phoneNumber: this.customerForm.value.ePhoneNumber
			},
			color: ''
		};

		let path = this.customerForm.value.path;
		if(this.pathNames.indexOf(path) > -1) {
			(this.model as any).path = '';
			this._nofication.createNotification('error', 'Error', 'The customer site name is existed. Please select another one.');
			return;
		} else if(this.preDefinedNames.indexOf(path) > -1) {
			(this.model as any).path = '';
			this._nofication.createNotification('error', 'Error', 'The customer site name is predefined. Please select another one.');
			return;
		}

		this.isCreateCustomer = false;
		this.customerKey = '';

		if(this.customerForm.value.uploadOption) {
			this.createNewCustomer();	
		} else {
			this.upload();	
		}
	}

	createNewCustomer() {
		this.customerPortalValue = {
    		'logo': (this.model as any).logo,
    		'name': (this.model as any).name,
    		'path': (this.model as any).path,
    	};
		
		(this.model as any).color = this.makeRandomColor();
		delete this.model['path'];
		delete this.model['logo'];

		let url = environment.APIS.CUSTOMERS;
		this._httpService.createAsList(url, this.model)
            .then(
                res  => {
                	this.customerKey = (res as any).key;
                	this.isCreateCustomer = true;
                	this.customerForm.reset();
                	this._nofication.createNotification('success', 'Success', 'New Customer is created successfully.');
                },
                error =>  console.error(error));
        this.createPortal();
	}

	createPortal(count: number=0) {
		if(count > 50) {
			console.log('Timeout to create new portal');
		} else if(!this.isCreateCustomer) {
			count ++;
			setTimeout(()=>this.createPortal(count), 50);
		} else {
			let url = environment.APIS.CUSTOMERPORTALS + '/';
			url += this.customerKey;
			this._httpService.postAsObject(url, this.customerPortalValue)
	            .then(
	                res  => {
	                	console.log('New Portal is created successfully.');
	                	this._router.navigate(['/customer'], { queryParams: {type: 'list'} });
	                },
	                error =>  console.error(error));
		}
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
                	(this.model as any).logo = url;
                	this.createNewCustomer();
                });
            });
        }
    }

}
