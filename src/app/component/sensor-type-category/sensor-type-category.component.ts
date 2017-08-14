import { Component,
	OnInit,
	OnChanges,
	Input,
	Output,
	EventEmitter,
	ViewContainerRef
} from '@angular/core';
import {
	Router
} from '@angular/router';
import { FormGroup,
	FormBuilder,
	Validators,
	FormControl
} from '@angular/forms';
import { environment }         from '../../../environments/environment';
import { HttpService }         from '../../service/http.service';
import { ConfirmModalService } from '../../modal/confirm-modal/confirm-modal.service';
import * as firebase from 'firebase';

@Component({
	selector: 'component-sensor-type-category',
	templateUrl: './sensor-type-category.component.html',
	styleUrls: ['./sensor-type-category.component.scss']
})
export class SensorTypeCategoryComponent implements OnInit, OnChanges {
	@Input() sensorType: Object;
	@Input() categoryType: number;
	@Input() isCreatable: boolean;
	@Input() selectedSensorTypeKey: string;
	@Input() sensorTypeName: string;

	rowForm: FormGroup;
	headerForm: FormGroup;

	@Output() updateTableTypeEmit = new EventEmitter();
	@Output() createRowParamEmit = new EventEmitter();
	@Output() createHeaderParamEmit = new EventEmitter();
	@Output() updateRowParamEmit = new EventEmitter();
	@Output() updateHeaderParamEmit = new EventEmitter();
	@Output() gotoSensorTypeInfoEmit = new EventEmitter();

	isSelectType: boolean;
	isHeaderRowType: boolean;
	isCreateNewRow: boolean;
	isCreateNewHeader: boolean;
	isCreateStatus: boolean;

	tableType: string;
	typeStatus: string;

	nSelectedRowParamId: number;
	nSelectedHeadParamId: number;

	formErrors: Object;
	headerModel: Object;
	rowModel: Object;
	relevantSensors: Object[];

	TABLE_TYPE = ['header_type', 'header_row_type'];
	PARAM_TYPE = ['option', 'number', 'text', 'time'];

	validationMessages = {
		'name': {
			'required': 'Name is required.',
			'minlength': 'Name must be at least 2 characters long.',
			'maxlength': 'Name can not be more that 24 characters long.'
		}
	};

	constructor(
		private _httpService: HttpService,
		private _confirmModalService: ConfirmModalService,
		private _viewContainerRef: ViewContainerRef,
		private _router: Router
	) {
		this.isSelectType = false;
		this.isCreateNewRow = false;
		this.isCreateNewHeader = false;
		this.isCreateStatus = false;
		this.tableType = this.TABLE_TYPE[0];
		this.isHeaderRowType = false;

		this.nSelectedRowParamId = -1;
		this.nSelectedHeadParamId = -1;
	}

	ngOnInit() {
		this.checkTypeStatus();
		this.initModel();
		this.initFormGroup();
	}

	ngOnChanges() {
		this.checkTypeStatus();
	}

	// init FormGroup
	initFormGroup() {
		// header Form Group
	    this.headerForm = new FormGroup({
	        name: new FormControl((this.headerModel as any).name, [
	        		<any>Validators.required,
	        		<any>Validators.minLength(2),
	        		<any>Validators.maxLength(25)
	        	])
	    });

	    this.headerForm.valueChanges.subscribe(data => this.onHeaderValueChanged(data));
	    
		// row Form Group
	    this.rowForm = new FormGroup({
	        name: new FormControl((this.rowModel as any).name, [
	        		<any>Validators.required,
	        		<any>Validators.minLength(2),
	        		<any>Validators.maxLength(25)
	        	]),
	        unit: new FormControl((this.rowModel as any).defaultValue, <any>Validators.required),
	        type: new FormControl((this.rowModel as any).type, <any>Validators.required)
	    });

	    this.rowForm.valueChanges.subscribe(data => this.onRowValueChanged(data));
	}

	// check the row validation
	onRowValueChanged(data?: any) {
		if(!this.rowForm) {return;}

		const form = this.rowForm;
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

	onTypeChange(event: any) {
		this.typeStatus = event;
	}

	// check the row validation
	onHeaderValueChanged(data?: any) {
		if(!this.headerForm) {return;}

		const form = this.headerForm;
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

	// init model
	initModel() {
		this.formErrors = {
			name: ''
		};

		this.headerModel = {
			name: '',
			id: ''
		};

		this.rowModel = {
			name: '',
			type: this.PARAM_TYPE[1],
			defaultValue: '',
			id: ''
		};
	}

	// check if the type is not defined yet
	checkTypeStatus() {
		this.initModel();
		this.initFormGroup();
		this.clearShowForm();
		this.getSensors();
		let type = (this.sensorType as any).tableType;
		if(!type || type === '') {
			this.isSelectType = true;
		} else {
			this.isSelectType = false;
			if(type === this.TABLE_TYPE[1]) {
				this.isHeaderRowType = true;

				if((this.sensorType as any).rows && (this.sensorType as any).rows.length > 0) {
					(this.sensorType as any).rows = (this.sensorType as any).rows.map(item => {
						item.detail = item.valueType;
						if(item.valueType === this.PARAM_TYPE[0]) {
							item.detail = '';

							if(item.defaultValue) {
								item.detail = item.defaultValue.join('/');
							}
						}
						return item;
					});
				}
			} else {
				this.isHeaderRowType = false;
			}
		}
	}

	// get sensors with the sensortype
	getSensors() {
		let sensorUrl = environment.APIS.SENSORS;
	    let sensorQuery = {
	    	query: {
				orderByChild: 'sensorTypeId',
				equalTo: this.selectedSensorTypeKey
			}
	    }

	    let sensorSub = this._httpService.getWithQuery(sensorUrl, sensorQuery).subscribe((sensors) => {
	    	sensorSub.unsubscribe();
	    	this.relevantSensors = sensors;
	    },
	    error => {
	    	console.log(error);
	    });
	}

	// update table type
	updateTableType() {
		this.updateTableTypeEmit.emit(this.tableType);
	}

	clearShowForm() {
		this.isCreateNewHeader = false;
		this.isCreateNewRow = false;
	}

	// an => A: alpha flag, an => N: numeric flag
	randomString(len: number, an: string = null){
	    an = an&&an.toLowerCase();
	    let str="", i=0, min=an=="a"?10:0, max=an=="n"?10:62;
	    for(;i++<len;){
	      let r = Math.random()*(max-min)+min <<0;
	      str += String.fromCharCode(r+=r>9?r<36?55:61:48);
	    }
	    return str;
	}

	// pop up confirm modal
	confirmSensorModal() {
		let alert = '<div class="description">You should delete all these sensors. The sensors are related to this sensor type.</div>';
    	alert += '<table class="table table-bordered"><thead><tr><th>Customer</th><th>Zone</th><th>Sensor</th></tr></thead><tbody>';
		for(let i=0; i<this.relevantSensors.length; i++) {
			let sensorItem = this.relevantSensors[i];
			let item = `<tr><td>${(sensorItem as any).customerId}</td><td>${(sensorItem as any).zoneId}</td><td>${(sensorItem as any).$key}</td></tr>`;
			alert += item;
		}
		alert += '</tbody></table>';

		this._confirmModalService.openDialog(alert, this._viewContainerRef)
			.then(dialog => {
				dialog.result.then(returnData => {
					if(returnData === 'agree') {
						this._router.navigateByUrl('customer');				
					}
				});
			});
	}

	/*
	*** header form action
	*/
	// show header param form
	showHeaderParam() {
		this.initModel();
		this.initFormGroup();
		this.clearShowForm();
		this.isCreateNewHeader = true;
		this.isCreateStatus = true;
	}

	// close header param form
	closeHeaderForm() {
		this.isCreateNewHeader = false;
	}

	// edit header param form
	editHeaderParams(index: number) {
		this.showHeaderParam();
		let head = (this.sensorType as any).heads[index];
		this.headerModel = {
			name: (head as any).name,
			id: (head as any).id
		};
		
		this.initFormGroup();
		this.isCreateStatus = false;
	}

	// create new header params
	submitHeaderParam() {
		if(this.isCreateStatus) {
			if(this.sensorType.hasOwnProperty('heads') && this.sensorType['heads'].length > 0) { // if primary key is existed
				this.createHeaderParamEmit.emit({
					name: this.headerForm.value.name,
					id: this.randomString(10)
				});
			} else { // primary key
				this.createHeaderParamEmit.emit({
					name: this.headerForm.value.name,
					id: this.randomString(10),
					primaryKey: true
				});
			}
			
		} else {
			(this.sensorType as any).heads[this.nSelectedHeadParamId].name = this.headerForm.value.name;
			(this.sensorType as any).heads[this.nSelectedHeadParamId].id = (this.headerModel as any).id;
			this.updateHeaderParamEmit.emit({data: (this.sensorType as any).heads,
				isDelete: false});
			this.checkTypeStatus();
		}
		
		this.isCreateNewHeader = false;
	}

	/*
	*** row form action
	*/

	// show row param form
	showRowParam() {
		this.initModel();
		this.initFormGroup();
		this.clearShowForm();
		this.isCreateNewRow = true;
		this.isCreateStatus = true;
		this.typeStatus = '';
	}

	// close row form
	closeRowForm() {
		this.isCreateNewRow = false;
	}

	// edit row param form
	editRowParams(index: number) {
		this.showRowParam();
		this.isCreateStatus = false;
		let row = (this.sensorType as any).rows[index];
		
		if((row as any).valueType === this.PARAM_TYPE[0]) {
			this.rowModel = {
				name: (row as any).name,
				type: (row as any).valueType,
				defaultValue: (row as any).defaultValue.join(','),
				id: (row as any).id
			};
		} else {
			this.rowModel = {
				name: (row as any).name,
				type: (row as any).valueType,
				id: (row as any).id
			};
		}
		
		this.initFormGroup();
		this.typeStatus = (this.rowModel as any).type;
	}

	// create new row params
	submitRowParam() {

		if(this.isCreateStatus) {
			if(this.rowForm.value.type === this.PARAM_TYPE[0]) {
				let optionValueArray = this.rowForm.value.unit.split(',');
				let str = 'The units will be ';
				str += optionValueArray;
				str += ';\n Is it ok?'
				if(!confirm(str)) {
					return;
				}

				this.createRowParamEmit.emit({
					name: this.rowForm.value.name,
					valueType: this.rowForm.value.type,
					defaultValue: optionValueArray,
					id: this.randomString(10)
				});
			} else {
				this.createRowParamEmit.emit({
					name: this.rowForm.value.name,
					valueType: this.rowForm.value.type,
					id: this.randomString(10)
				});
			}

		} else {
			if(this.rowForm.value.type === this.PARAM_TYPE[0]) {
				let optionValueArray = this.rowForm.value.unit.split(',');
				let str = 'The units will be ';
				str += optionValueArray;
				str += ';\n Is it ok?'
				if(!confirm(str)) {
					return;
				}
				(this.sensorType as any).rows[this.nSelectedRowParamId].name = this.rowForm.value.name;
				(this.sensorType as any).rows[this.nSelectedRowParamId].valueType = this.rowForm.value.type;
				(this.sensorType as any).rows[this.nSelectedRowParamId].defaultValue = optionValueArray;
				(this.sensorType as any).rows[this.nSelectedRowParamId].id = (this.rowModel as any).id;
				this.updateRowParamEmit.emit({data: (this.sensorType as any).rows,
					isDelete: false});
				this.checkTypeStatus();
			} else {
				(this.sensorType as any).rows[this.nSelectedRowParamId].name = this.rowForm.value.name;
				(this.sensorType as any).rows[this.nSelectedRowParamId].valueType = this.rowForm.value.type;
				(this.sensorType as any).rows[this.nSelectedRowParamId].id = (this.rowModel as any).id;
				this.updateRowParamEmit.emit({data: (this.sensorType as any).rows,
					isDelete: false});
				this.checkTypeStatus();
			}
		}

		this.isCreateNewRow = false;
		
	}

	onChangeType(value: string) {
		this.typeStatus = value;
	}

	selectRowSensorType(index: number) {
		this.nSelectedHeadParamId = -1;
		this.nSelectedRowParamId = index;
	}

	selectHeadSensorType(index: number) {
		this.nSelectedRowParamId = -1;
		this.nSelectedHeadParamId = index;
	}

	deleteHeaderParams(index: number) {
		this.updateHeaderParamEmit.emit({data: (this.sensorType as any).heads,
			isDelete: true,
			deleteId: index
		});
	}

	deleteRowParams(index: number) {
		this.updateRowParamEmit.emit({data: (this.sensorType as any).rows,
			isDelete: true,
			deleteId: index
		});
	}

	gotoSensorInfo() {
		this.gotoSensorTypeInfoEmit.emit();
	}
}
