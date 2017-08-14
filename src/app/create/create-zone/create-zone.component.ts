import { Component,
	Input,
	OnInit } from '@angular/core';
import { FormGroup,
	FormBuilder,
	Validators,
	FormControl
} from '@angular/forms';
import { environment }         from '../../../environments/environment';
import { HttpService }         from '../../service/http.service';
import { AuthService }         from '../../service/auth.service';
import { NotificationService } from '../../service/notification.service';
import { Router }              from '@angular/router';

@Component({
	selector: 'component-create-zone',
	templateUrl: './create-zone.component.html',
	styleUrls: ['./create-zone.component.scss']
})

export class CreateZoneComponent implements OnInit {
	@Input() customerId: string;
	@Input() createName: string;

	model: Object;
	bIsLoading: boolean;
	uid: string;

	CREATENAMES: string[];

	zoneForm: FormGroup;

	formErrors: Object;

	CRITICALITIES = ['high', 'medium', 'low'];

	validationMessages = {
		'name': {
			'required': 'Name is required.',
			'minlength': 'Name must be at least 2 characters long.',
			'maxlength': 'Name can not be more that 24 characters long.'
		}
	};

	constructor(
		private _httpService: HttpService,
		private _authService: AuthService,
		private _nofication: NotificationService,
		private _router: Router
		) {
		this.bIsLoading = false;
		this.uid = null;

		this.CREATENAMES = ['customer', 'zone'];

		this._authService.checkLoginStatus().then((result) => {
			if(result) {
				this.uid = (result as any).uid;
				this.bIsLoading = true;
			}
		}, error => {
			console.log('Authentication Error.');
			console.log(error);
			this._router.navigateByUrl('dashboard');
		});
	}

	ngOnInit() {
		this.formErrors = {
			name: ''
		};

		this.model = {
			name: '',
			description: '',
			color: '',
			criticality: '',
			customerId: this.customerId
		};

		this.zoneForm = new FormGroup({
	        name: new FormControl((this.model as any).name, [
	        		<any>Validators.required,
	        		<any>Validators.minLength(2),
	        		<any>Validators.maxLength(25)
	        	]),
	        criticality: new FormControl((this.model as any).criticality, [
	        		<any>Validators.required
	        	]),
	        description: new FormControl()
	    });

	    this.zoneForm.valueChanges.subscribe(data => this.onValueChanged(data));
	}

	// check the validation
	onValueChanged(data?: any) {
		if(!this.zoneForm) {return;}

		const form = this.zoneForm;
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
		this.model = {
			name: this.zoneForm.value.name,
			description: this.zoneForm.value.description,
			color: this.makeRandomColor(),
			customerId: this.customerId
		};

		let url = environment.APIS.ZONES;

		this._httpService.createAsList(url, this.model)
            .then(
                res  => {
                	this._nofication.createNotification('success', 'New Zone', 'New zone is created successful!');
                	if(this.createName === this.CREATENAMES[0]) {
                		this._router.navigate(['/customer'], { queryParams: {type: 'list', customerId: this.customerId} });	
                	} else {
                		this._router.navigate(['/zone'], { queryParams: {type: 'list'} });
                	}
                	this.zoneForm.reset();
                },
                error =>  console.error(error));
	}
}
