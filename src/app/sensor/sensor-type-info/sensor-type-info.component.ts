import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment }         from '../../../environments/environment';
import { HttpService }         from '../../service/http.service';
import { DataService }         from '../../service/data.service';

@Component({
	selector: 'app-sensor-type-info',
	templateUrl: './sensor-type-info.component.html',
	styleUrls: ['./sensor-type-info.component.css']
})
export class SensorTypeInfoComponent implements OnInit {
	nActionNumber: number;

	isPageLoading: boolean;
	isRowHeader: boolean;
	isHeaderShow: boolean;
	isRowShow: boolean;
	isDebug: boolean;

	selectedSensorType: Object;
	sensorTypes: Object[];

	STATUSNAMES = ['status', 'vocAnalytics', 'vocRaw', 'processedData', 'debug'];
	TABLETYPE = ['header_type', 'header_row_type'];
	PARATYPE = ['option'];

	constructor(
		private _activeRoute: ActivatedRoute,
		private _dataService: DataService,
		private _httpService: HttpService
	) {
		this.nActionNumber = -1;/*0: status, 1:voc analytics, 2:voc raw, 3:processed data, 4:debug*/
		this.isPageLoading = false;
		this.isRowHeader = false;
		this.isHeaderShow = false;
		this.isRowShow = false;
		this.isDebug = false;
	}

	ngOnInit() {
		this._activeRoute.params.subscribe(params => {
			let sensorTypeId = params['id'];
			let fieldUrl = environment.APIS.SENSORTYPES;
			this._httpService.getAsList(`${fieldUrl}/${sensorTypeId}`).subscribe(programs => {console.log(programs);
		    	this.sensorTypes = programs;
		    	this.isPageLoading = true;

		    	this.changeStatus(0);
		    },
		    error => {
		    	console.log(error);
		    });
		});

		this.checkAvailability();
	}

	checkAvailability() {
		let userType = this._dataService.getString('customer_id');

		if(userType && userType !== '') {//customer
			this.isDebug = false;
		} else {//staff
			this.isDebug = true;
		}
	}

	changeStatus(statusIndex: number) {
		this.nActionNumber = statusIndex;
		let that =this;

		let types = this.sensorTypes.filter(function(x) {
			return (x as any).$key === that.STATUSNAMES[that.nActionNumber];
		});

		this.selectedSensorType = types[0];

		if((this.selectedSensorType as any).tableType === this.TABLETYPE[1]) {
			this.isRowHeader = true;
		} else {
			this.isRowHeader = false;
		}
		
		if((this.selectedSensorType as any).heads) {
			this.isHeaderShow = true;
		} else {
			this.isHeaderShow = false;
		}

		if((this.selectedSensorType as any).rows) {
			this.isRowShow = true;
		} else {
			this.isRowShow = false;
		}
	}

}
