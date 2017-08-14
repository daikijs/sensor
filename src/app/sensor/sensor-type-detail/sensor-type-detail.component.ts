import { Component,
	OnInit,
	Input,
	OnDestroy,
	ViewContainerRef,
	ElementRef,
	ViewChild,
	AfterContentChecked
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
import { HttpService }         from '../../service/http.service';
import { DataService }         from '../../service/data.service';
import { ConfirmModalService } from '../../modal/confirm-modal/confirm-modal.service';
import { NotificationService } from '../../service/notification.service';
import { SpinnerService }      from '../../service/spinner.service';
import * as _ from 'lodash';

const SENSORTYPES_NAMES = ['status', 'vocAnalytics', 'vocRaw', 'processedData', 'debug'];
const VALUE_TYPES = ['option', 'number', 'text', 'time'];
const SENSOR_TYPES = ['header_row_type', 'header_type'];

@Component({
  selector: 'component-sensor-type-detail',
  templateUrl: './sensor-type-detail.component.html',
  styleUrls: ['./sensor-type-detail.component.scss']
})

export class SensorTypeDetailComponent implements OnInit, OnDestroy, AfterContentChecked {
	type: number;
	status: number;
	selectedSensorTypeId: number;
	deletedCounter: number;
	totalCounter: number;
	nMAHeight: number;

	userRole: string;
	userType: string;
	sensorTypeName: string;
	sensorTypeLinkName: string;
	selectedSensorTypeKey: string;

	isCreateSensorType: boolean;
	isEditSensorType: boolean;
	isCreatable: boolean;
	isPageLoading: boolean;
	isUpdateToggle: boolean;
	isDebugDisplay: boolean;

	arrSensorTypes: any[]; // sensor types

	focusCategory: Object;

	stForm: FormGroup;

	sensorTypeSub: any;
	@ViewChild('entireScreen') entireScreen: ElementRef;
	@ViewChild('buttonsScreen') buttonsScreen: ElementRef;

	constructor(
		private _httpService: HttpService,
		private _spinner: SpinnerService,
		private _confirmModalService: ConfirmModalService,
		private _viewContainerRef: ViewContainerRef,
		private _nofication: NotificationService,
		private _router: Router,
		private _dataService: DataService) {
		this.type = -1; //0: status, 1: voc analytics, 2: voc raw, 3: processed data, 4: debug
		this.status = 0; //0: none, 1: edit, 2: create

		this.selectedSensorTypeId = -1;
		this.isPageLoading = false;
		this.isCreateSensorType = false;
		this.isEditSensorType = false;
		this.isUpdateToggle = false;
		this.isDebugDisplay = false;

		this.loadData();
	}

	ngOnInit() {
		this.initTypeForm('');
	}

	initTypeForm(name: string) {
		this.stForm = new FormGroup({
	        name: new FormControl(name, [
	        		<any>Validators.required
	        	])
	    });
	}

	ngOnDestroy() {
		if(this.sensorTypeSub) {
			this.sensorTypeSub.unsubscribe();
		}
	}

	ngAfterContentChecked() {
		this.setMainHeight();
	}

	setMainHeight(count: number = 0) {
		if(count > 100) {
			console.log('Timeout!');
		} else if(!this.buttonsScreen ||
			this.entireScreen.nativeElement.offsetHeight === 0 ||
			this.buttonsScreen.nativeElement.offsetHeight === 0) {
			count ++;
			setTimeout(()=>this.setMainHeight(count), 50);
		} else {
			this.nMAHeight = this.entireScreen.nativeElement.offsetHeight - this.buttonsScreen.nativeElement.offsetHeight;
		}
	}

	checkAvailability() {
		this.userType = this._dataService.getString('customer_id');
		this.userRole = this._dataService.getString('user_role');

		if(this.userType && this.userType !== '') {//customer
			this.isCreatable = false;
			this.isDebugDisplay = false;
		} else {//staff
			if(this.userRole === 'admin' || this.userRole === 'developer') {
				this.isCreatable = true;
			} else {
				this.isCreatable = false;
			}

			this.isDebugDisplay = true;
		}
	}

	loadData() {
		this._spinner.start();
		let fieldUrl = environment.APIS.SENSORTYPES;
		this.sensorTypeSub = this._httpService.getAsList(fieldUrl).subscribe(programs => {
	    	this.arrSensorTypes = programs;
	    	this.arrSensorTypes = _.uniqBy(this.arrSensorTypes, '$key');console.log(this.arrSensorTypes);

	    	if(this.selectedSensorTypeId === -1) {
	    		this.selectedSensorTypeId = 0;
	    		this.selectedSensorTypeKey = (this.arrSensorTypes[0] as any).$key;
	    	}

	    	if(!this.isPageLoading) {
	    		this.goTargetNavigation(0);
	    	} else {
	    		this.goTargetNavigation(this.type);
	    	}

	    	this._spinner.stop();
	    	this.isPageLoading = true;
	    	this.isUpdateToggle = this.isUpdateToggle ? false : true;
	    },
	    error => {
	    	console.log(error);
	    });

		this.checkAvailability();
	}

	/*
	*** sensor type start ***
	*/
	// select the sensor type
	selectSensorType(sensorTypeIndex: number) {
		this.selectedSensorTypeId = sensorTypeIndex;
		this.goTargetNavigation(0);
		this.selectedSensorTypeKey = (this.arrSensorTypes[sensorTypeIndex] as any).$key;
	}

	// edit the sensor title
	editSensorType(sensorType: Object) {
		this.isEditSensorType = true;
		this.sensorTypeName = (sensorType as any).typeName;
		this.selectedSensorTypeKey = (sensorType as any).$key;
		this.initTypeForm(this.sensorTypeName);
	}

	// delete the sensor type
	deleteSensorType(typeKey: string) {
		let sensorUrl = environment.APIS.SENSORS;
	    let sensorQuery = {
	    	query: {
				orderByChild: 'sensorTypeId',
				equalTo: typeKey
			}
	    }

	    let sensorSub = this._httpService.getWithQuery(sensorUrl, sensorQuery).subscribe((sensors) => {
	    	sensorSub.unsubscribe();

	    	if(sensors && sensors.length > 0) {
	    		let alert = '<div class="description">You should delete all the sensors.</div>';
		    	alert += '<table class="table table-bordered"><thead><tr><th>Customer</th><th>Zone</th><th>Sensor</th></tr></thead><tbody>';
				for(let i=0; i<sensors.length; i++) {
					let item = `<tr><td>${sensors[i].customerId}</td><td>${sensors[i].zoneId}</td><td>${sensors[i].$key}</td></tr>`;
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
	    	} else {
	    		let alert = 'Are you sure to delete the sensor type?';
	    		this._confirmModalService.openDialog(alert, this._viewContainerRef)
					.then(dialog => {
						dialog.result.then(returnData => {
							if(returnData === 'agree') {
								let url = environment.APIS.SENSORTYPES;
								this._httpService.deleteAsObject(`${url}/${typeKey}`)
						            .then(
						                res  => {
						                	this._nofication.createNotification('success', 'Success', 'The user type deleted Successfully!');
						                	this.clearSensorTypeForm();
						                },
						                error =>  console.error(error));
							}
						});
					});
	    	}
	    	
		}, error => {
			console.log(error);
			console.log('You do not have the permission for the sensor table.');
			this._router.navigateByUrl('dashboard');
		});
	}

	// clear the create sensor type form
	clearSensorTypeForm() {
		this.sensorTypeName = '';
		this.isCreateSensorType = false;
		this.isEditSensorType = false;
		this.selectedSensorTypeId = -1;
		this.selectedSensorTypeKey = null;
	}

	showSensorTypeForm() {
		this.sensorTypeName = '';
		this.isCreateSensorType = true;
		this.initTypeForm('');
	}

	// crete new sensor type
	submitSensorType() {
		let url = environment.APIS.SENSORTYPES;

		if(this.isCreateSensorType) {// create type
			let newData = {
				typeName: this.stForm['value']['name'],
				status: {
					tableType: ''
				},
				vocAnalytics: {
					tableType: ''
				},
				vocRaw: {
					tableType: ''
				},
				processedData: {
					tableType: ''
				},
				debug: {
					tableType: ''
				}
			};

			this._httpService.createAsList(url, newData)
	            .then(
	                res  => {
	                	this._nofication.createNotification('success', 'Success', 'One sensor type created Successfully!');
	                	this.clearSensorTypeForm();
	                },
	                error =>  console.error(error));
		}
		
		if(this.isEditSensorType) {// edit type
			
			let value = {typeName: this.stForm['value']['name']};
			this._httpService.updateAsObject(`${url}/${this.selectedSensorTypeKey}`, value)
	            .then(
	                res  => {
	                	this._nofication.createNotification('success', 'Success', 'The sensor type updated Successfully!');
	                	this.clearSensorTypeForm();
	                },
	                error =>  console.error(error));
		}
		
	}

	// cancel to crete new sensor type
	cancelSensorType() {
		this.clearSensorTypeForm();
	}

	/*
	*** sensor type end ***
	*/

	goTargetNavigation(navNumber: number) {
		this.type = navNumber;
		let that = this;
		this.sensorTypeLinkName = (this.arrSensorTypes[this.selectedSensorTypeId] as any).typeName;

		switch (navNumber) {
			case 0:
				// status
				that.focusCategory = (that.arrSensorTypes[that.selectedSensorTypeId] as any).status;
				break;

			case 1:
				// vocAnalytics
				that.focusCategory = (that.arrSensorTypes[that.selectedSensorTypeId] as any).vocAnalytics;
				break;

			case 2:
				// vocRaw
				that.focusCategory = (that.arrSensorTypes[that.selectedSensorTypeId] as any).vocRaw;
				break;

			case 3:
				// processedData
				that.focusCategory = (that.arrSensorTypes[that.selectedSensorTypeId] as any).processedData;
				break;

			case 4:
				// debug
				that.focusCategory = (that.arrSensorTypes[that.selectedSensorTypeId] as any).debug;
				break;
			
			default:
				this._nofication.createNotification('error', 'Error', 'Your category is not available.');
				break;
		}
	}

	updateTableTypeEmit(event: any) {
		let selectedSensorType = this.arrSensorTypes[this.selectedSensorTypeId];
		let url = environment.APIS.SENSORTYPES;
		let value = {tableType: event};

		this._httpService.updateAsObject(`${url}/${(selectedSensorType as any).$key}/${SENSORTYPES_NAMES[this.type]}`, value)
            .then(
                res  => {
                	this._nofication.createNotification('success', 'Success', 'The table type is created Successfully!');
                },
                error =>  console.error(error));
	}

	checkDeleteStatus(totalCounter: number, currentCounter: number) {
		if(totalCounter <= currentCounter) {
			this._spinner.stop();
		}
	}

	// check if name field is already existed
	checkExistedName(newField: Object, arrField: Object[]) {
		if(!newField) {
			console.log('New field is not existed');
			return true;
		}

		if(arrField && arrField.length > 0) {
			for(let i=0; i<arrField.length; i++) {
				if(newField['name'] && arrField[i]['name']) {
					if(newField['name'] === arrField[i]['name']) {
						return true;
					}
				}
			}
		}

		return false;
	}

	/*
	Row Param action
	*/
	// create new row param
	createRowParamEmit(event: any) {
		let selectedSensorType = this.arrSensorTypes[this.selectedSensorTypeId];
		let category = SENSORTYPES_NAMES[this.type];
		let values = selectedSensorType[category]['rows'];
		if(!values) {
			values = [];
		}

		values = values.map(item => {
			delete item['detail'];
			return item;
		});

		if(this.checkExistedName(event, values)) {
			this._nofication.createNotification('alert', 'Alert', 'The field name is already existed!');
			return;
		}

		values.push(event);
		let url = environment.APIS.SENSORTYPES;
		let value = {rows: values};

		this._httpService.updateAsObject(`${url}/${(selectedSensorType as any).$key}/${SENSORTYPES_NAMES[this.type]}`, value)
            .then(
                res  => {
                	this._nofication.createNotification('success', 'Success', 'New row param added Successfully!');
                },
                error =>  console.error(error));
	}

	// update new row param
	updateRowParamEmit(event: any) {
		let selectedSensorType = this.arrSensorTypes[this.selectedSensorTypeId];
		let values = event.data.map(item => {
			delete item['detail'];
			return item;
		});

		let sensorTypeUrl = environment.APIS.SENSORTYPES;
		let value = {rows: values};

	    if(event.isDelete) {
	    	let alert = 'Are you sure to delete the sensor type?';
    		this._confirmModalService.openDialog(alert, this._viewContainerRef)
				.then(dialog => {
					dialog.result.then(returnData => {
						if(returnData === 'agree') {
							let deletedDataKey = value.rows[event.deleteId].id;
							(value as any).rows.splice(event.deleteId, 1);
							this._spinner.start();

							// delete the sensor type param in the sensor type table
							this._httpService.updateAsObject(`${sensorTypeUrl}/${(selectedSensorType as any).$key}/${SENSORTYPES_NAMES[this.type]}`, value)
					            .then(
					                res  => {
					                	this._nofication.createNotification('success', 'Success', 'The row param updated Successfully!');
					                	this._spinner.stop();
					                },
					                error =>  console.error(error));

					        // delete the sensor type param in the relevant sensor data table
					  		if(deletedDataKey) {
					  			// initial the counter for checking the delete status
					  			this.totalCounter = 0;
					  			this.deletedCounter = 0;
					  			this._spinner.start();

					  			let sensorDataUrl = environment.APIS.SENSORDATA;

						        let sensorDataQuery = {
						        	query: {
						        		orderByChild: 'sensorTypeId',
						        		equalTo: (selectedSensorType as any).$key
						        	}
						        };

						        let sensorDataSub = this._httpService.getWithQuery(`${sensorDataUrl}/${SENSORTYPES_NAMES[this.type]}`, sensorDataQuery).subscribe((data) => {
						        	sensorDataSub.unsubscribe();
						        	
						        	if(data && data.length > 0) {
						        		for(let i=0; i < data.length; i++) {
						        			let seriesSub = this._httpService.getAsList(`${sensorDataUrl}/${SENSORTYPES_NAMES[this.type]}/${data[i].$key}/series`).subscribe((sensorDataSeries) => {
						        				seriesSub.unsubscribe();
						        				this.totalCounter += sensorDataSeries.length;

						        				if(sensorDataSeries && sensorDataSeries.length > 0) {
						        					for(let s = 0; s < sensorDataSeries.length; s++) {
							        					this._httpService.deleteAsObject(`${sensorDataUrl}/${SENSORTYPES_NAMES[this.type]}/${data[i].$key}/series/${sensorDataSeries[s].$key}/value/${deletedDataKey}`)
												            .then(
												                res  => {
												                	console.log('The sensor data param deleted Successfully!');
												                	this.deletedCounter ++;
												                	this.checkDeleteStatus(this.totalCounter, this.deletedCounter);
												                },
												                error =>  console.error(error));
							        				}
						        				}
										    },
										    error => {
										    	console.log(error);
										    });
						        		}
						        	}
						        }, error => {
									console.log(error);
									console.log('You do not have the permission for the sensor data table.');
									this._router.navigateByUrl('dashboard');
								});
					  		} else {
					  			console.log('The data key is not existed');
					  			this._spinner.stop();
					  		}
						} else {
							this.loadData();
						}
					});
				});
	    } else {
	    	this._httpService.updateAsObject(`${sensorTypeUrl}/${(selectedSensorType as any).$key}/${SENSORTYPES_NAMES[this.type]}`, value)
	            .then(
	                res  => {
	                	this._nofication.createNotification('success', 'Success', 'The row param updated Successfully!');
	                },
	                error =>  console.error(error));
	    }
	}

	/*
	Header Param action
	*/
	// create new header param
	createHeaderParamEmit(event: any) {
		let selectedSensorType = this.arrSensorTypes[this.selectedSensorTypeId];
		let category = SENSORTYPES_NAMES[this.type];
		let values = selectedSensorType[category]['heads'];
		if(!values) {
			values = [];
		}

		if(this.checkExistedName(event, values)) {
			this._nofication.createNotification('alert', 'Alert', 'The field name is already existed!');
			return;
		}

		values.push(event);
		let url = environment.APIS.SENSORTYPES;
		let value = {heads: values};

		this._httpService.updateAsObject(`${url}/${(selectedSensorType as any).$key}/${SENSORTYPES_NAMES[this.type]}`, value)
            .then(
                res  => {
                	this._nofication.createNotification('success', 'Success', 'New header param added Successfully!');
                },
                error =>  console.error(error));
	}

	// update new header param
	updateHeaderParamEmit(event: any) {
		console.log(event);
		let selectedSensorType = this.arrSensorTypes[this.selectedSensorTypeId];
		let url = environment.APIS.SENSORTYPES;
		let value = {heads: event.data};

	    if(event.isDelete) {
	    	// check if the param is primary key
			if(event['data'][event.deleteId].hasOwnProperty('primaryKey') &&
				event['data'][event.deleteId]['primaryKey']) {
				this._nofication.createNotification('alert', 'Alert', 'This param is primary key, so you can not delete.');
				return;
			}

    		let alert = 'Are you sure to delete the sensor type?';
    		this._confirmModalService.openDialog(alert, this._viewContainerRef)
				.then(dialog => {
					dialog.result.then(returnData => {
						if(returnData === 'agree') {
							let deletedDataKey = value.heads[event.deleteId].id;
							(value as any).heads.splice(event.deleteId, 1);
							this._spinner.start();

							this._httpService.updateAsObject(`${url}/${(selectedSensorType as any).$key}/${SENSORTYPES_NAMES[this.type]}`, value)
					            .then(
					                res  => {
					                	this._nofication.createNotification('success', 'Success', 'Header param updated Successfully!');
					                	this._spinner.stop();
					                },
					                error =>  console.error(error));

					  		// delete the sensor type param in the relevant sensor data table
					  		if(deletedDataKey) {
					  			// initial the counter for checking the delete status
					  			this.totalCounter = 0;
					  			this.deletedCounter = 0;
					  			this._spinner.start();

					  			let category = selectedSensorType[SENSORTYPES_NAMES[this.type]];
					  			let sensorDataUrl = environment.APIS.SENSORDATA;

						        let sensorDataQuery = {
						        	query: {
						        		orderByChild: 'sensorTypeId',
						        		equalTo: (selectedSensorType as any).$key
						        	}
						        };

						        let sensorDataSub = this._httpService.getWithQuery(`${sensorDataUrl}/${SENSORTYPES_NAMES[this.type]}`, sensorDataQuery).subscribe((data) => {
						        	sensorDataSub.unsubscribe();
						        	if(data && data.length > 0) {

						        		for(let i=0; i < data.length; i++) {

					        				let seriesSub = this._httpService.getAsList(`${sensorDataUrl}/${SENSORTYPES_NAMES[this.type]}/${data[i].$key}/series`).subscribe((sensorDataSeries) => {
						        				seriesSub.unsubscribe();
						        				this.totalCounter += sensorDataSeries.length;
						        				
						        				for(let s = 0; s < sensorDataSeries.length; s++) {
						        					if(sensorDataSeries[s] && sensorDataSeries[s].hasOwnProperty('value')) {
							        					let values = sensorDataSeries[s]['value'];
							        					if(category.tableType === SENSOR_TYPES[0]) { // row-header case
								        					for(let pro in values) {
								        						if(values.hasOwnProperty(pro) && values[pro].hasOwnProperty(deletedDataKey)) {
								        							delete values[pro][deletedDataKey];
								        						}
								        					}
								        				} else { // header case
						        							if(values.hasOwnProperty(deletedDataKey)) {
						        								delete values[deletedDataKey];
						        							}
								        				}

								        				this._httpService.updateAsObject(`${sensorDataUrl}/${SENSORTYPES_NAMES[this.type]}/${data[i].$key}/series/${sensorDataSeries[s].$key}/value`, values)
												            .then(
												                res  => {
												                	console.log('The sensor data param deleted Successfully!');
												                	this.deletedCounter ++;
												                	this.checkDeleteStatus(this.totalCounter, this.deletedCounter);
												                },
												                error =>  console.error(error));
							        				} else {
							        					console.log('The sensor data series are not existed.');
							        				}
						        				}
										    },
										    error => {
										    	console.log(error);
										    });
						        		}
						        	}
						        }, error => {
									console.log(error);
									console.log('You do not have the permission for the sensor data table.');
									this._router.navigateByUrl('dashboard');
								});
					  		} else {
					  			console.log('The data key is not existed');
					  			this._spinner.stop();
					  		}
						} else {
							this.loadData();
						}
					});
				});
	    } else {
	    	this._httpService.updateAsObject(`${url}/${(selectedSensorType as any).$key}/${SENSORTYPES_NAMES[this.type]}`, value)
	            .then(
	                res  => {
	                	this._nofication.createNotification('success', 'Success', 'Header param updated Successfully!');
	                },
	                error =>  console.error(error));
	    }
	}

	gotoSensorTypeInfoEmit() {
		let selectedSensorType = this.arrSensorTypes[this.selectedSensorTypeId];
		this._router.navigateByUrl(`sensor_type_info/${(selectedSensorType as any).$key}`);
	}
}
