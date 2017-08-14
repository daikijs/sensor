import { Component,
	OnInit,
	Input,
	ElementRef,
	OnDestroy,
	OnChanges,
	ViewChild,
	ViewContainerRef
} from '@angular/core';
import { Router,
	ActivatedRoute
} from '@angular/router';
import { environment }         from '../../../environments/environment';
import { HttpService }         from '../../service/http.service';
import { DataService }         from '../../service/data.service';
import { NotificationService } from '../../service/notification.service';
import { SpinnerService }      from '../../service/spinner.service';
import { PurehttpService }     from '../../service/purehttp.service';
import { ConfigModalService }  from '../../modal/config-modal/config-modal.service';
import { ConfigModalContext }  from '../../modal/config-modal/config-modal.context';
import { MapsAPILoader }       from 'angular2-google-maps/core';
import { DialogRef }           from 'angular2-modal';
import { AmChartsService }     from "amcharts3-angular2";
import * as firebase from 'firebase';
import * as _ from 'lodash';

@Component({
  selector: 'component-sensor-detail',
  templateUrl: './sensor-detail.component.html',
  styleUrls: ['./sensor-detail.component.scss']
})
export class SensorDetailComponent implements OnInit, OnDestroy, OnChanges {
	@Input() windowH: number;
	@Input() selectedSensor: any;
	@Input() sensorKey: string;
	@ViewChild('chartBodyElement') chartBodyElement: ElementRef;
	@ViewChild('adcTabElement') adcTabElement: any;
	@ViewChild('cdcTabElement') cdcTabElement: any;
	@ViewChild('flowTabElement') flowTabElement: any;

	queryParamSub: any;
	categorySub: any;
	sensorTypeSub: any;
	sensorActionSub: any;
	configurationSub: any;

	adcChart: any;
	cdcChart: any;

	csvData: any;

	adcOptions: Object;
	adcData: any;
	cdcOptions: Object;
	cdcData: any;
	flowOptions: Object;
	flowData: any;
	configData: any;

	strSensorTypeName: string;
	paramValue: string;
	error: string;
	userRole: string;
	userRoles: string[];
	responseValue: string;

	nActionNumber: number;
	nStatus: number;
	nSelectedChartInd: number;
	nActionStatus: number;

	isTypeLoading: boolean;
	isDataLoading: boolean;
	isRowHeader: boolean;
	isHeaderShow: boolean;
	isRowShow: boolean;
	isEditStatus: boolean;
	isAction: boolean;
	isChart: boolean;
	isAdcCaled: boolean;
	isCdcCaled: boolean;
	isFloCaled: boolean;
	isGetConfig: boolean;
	isDeviceOnline: boolean;

	isStatus: boolean;
	isVocAnalytics: boolean;
	isDebug: boolean;
	isStatusEditable: boolean;
	isVocAnalyticsEditable: boolean;
	isDebugEditable: boolean;

	selectedSensorType: Object;
	sensorType: Object;
	values: any[];

	STATUSNAMES = ['status', 'vocAnalytics', 'vocRaw', 'processedData', 'debug'];
	TABLETYPE = ['header_type', 'header_row_type'];
	PARATYPE = ['option'];
	SENSOR_MAP = [
		'name',
		'address',
		'availability',
		'lat',
		'lng',
		'description',
		'serialNumber'
	];
	AVAILABILITIES: string[];

	constructor(
		private _httpService: HttpService,
		private _spinner: SpinnerService,
		private _activeRoute: ActivatedRoute,
		private _router: Router,
		private elRef: ElementRef,
		private _nofication: NotificationService,
		private _mapApiLoader: MapsAPILoader,
		private _purehttpService: PurehttpService,
		private _dataService: DataService,
		private _configModalService: ConfigModalService,
		private _viewContainerRef: ViewContainerRef,
		private _amCharts: AmChartsService
	) {
		this.nActionNumber = -1;/*0: status, 1:voc analytics, 2:voc raw, 3:processed data, 4:debug*/
		this.nStatus = -1; // 0: none, 1>=: edit status
		this.nActionStatus = -1;
		this.nSelectedChartInd = 0;
		this.isTypeLoading = false;
		this.isDataLoading = false;

		this.isRowHeader = false;
		this.isHeaderShow = false;
		this.isRowShow = false;
		this.isEditStatus = false;
		this.isStatus = false;
		this.isVocAnalytics = false;
		this.isDebug = false;
		this.isStatusEditable = false;
		this.isVocAnalyticsEditable = false;
		this.isDebugEditable = false;
		this.isAction = false;
		this.isGetConfig = false;
		this.isDeviceOnline = false;

		this.userRole = this._dataService.getString('user_role');
		this.userRoles = environment['userRoles'];
		this.AVAILABILITIES = environment['deviceStatus'];
	}

	ngOnInit() {
		this.checkUserRole();
		
		this.queryParamSub = this._activeRoute.queryParams.subscribe(params => {
			if(params['type'] === 'edit') {
				this.isEditStatus = true;
			} else {
				this.isEditStatus = false;
			}
		});

		if(this.userRole === this.userRoles[0]) { // if loggined user is admin
			let sensorDevicUrl = environment.APIS.SENSORDEVICES;
			this.sensorActionSub = this._httpService.getAsObject(`${sensorDevicUrl}/${this.sensorKey}`).subscribe((res) => {
				console.log(res);

				this.nActionStatus = parseInt(res['actionStatus']);
				switch (this.nActionStatus) {
					case 0: // configuration
						this.isDeviceOnline = true;
						break;
					case 1: // configuration
						this.isDeviceOnline = true;
						break;
					case 2: // start
						this.isDeviceOnline = true;
						break;
					case 3: // stop
						this.isDeviceOnline = true;
						break;
					case 4: // shut down
						this.isDeviceOnline = true;
						break;
					
					default: // offline
						this.isDeviceOnline = false;

						if(this.userRole === this.userRoles[0] && this.isEditStatus) {
							console.log('info', 'Status', "Sensor device is now offline");
						}
						break;
				}

				let resVal = res['resVal'];
				if(!resVal) {
					let updateResValue = <any>{};
					updateResValue['resVal'] = '';

					this._httpService.updateAsObject(`${sensorDevicUrl}/${this.sensorKey}`, updateResValue)
			            .then(
			                res  => {
			                	console.log('Sensor device resVal field is set to default status');
			                },
			                error =>  console.error(error));
				}
			}, error => {
				console.log(error);
			});
		}
	}

	checkUserRole() {
		let userType = this._dataService.getString('customer_id');

		if(!userType) { // staff
			/*view*/
			// status
			let roles = ['admin', 'debugger', 'operator', 'viewer'];
			if(roles.indexOf(this.userRole) > -1) {
				this.isStatus = true;
			} else {
				this.isStatus = false;
			}

			// voc analytics
			if(this.userRole === 'debugger') {
				this.isVocAnalytics = true;
			} else {
				this.isVocAnalytics = false;
			}
			
			// debugger
			roles = ['admin', 'debugger', 'operator', 'viewer'];
			if(roles.indexOf(this.userRole) > -1) {
				this.isDebug = true;
			} else {
				this.isDebug = false;
			}

			/*editable*/
			roles = ['admin', 'debugger', 'operator'];
			if(roles.indexOf(this.userRole) > -1) {
				this.isStatusEditable = true;
			} else {
				this.isStatusEditable = false;
			}

			// voc analytics
			if(this.userRole === 'debugger') {
				this.isVocAnalyticsEditable = true;
			} else {
				this.isVocAnalytics = false;
			}

			// debugger
			roles = ['admin', 'debugger', 'operator'];
			if(roles.indexOf(this.userRole) > -1) {
				this.isDebugEditable = true;
			} else {
				this.isDebugEditable = false;
			}			
		} else {
			/*view*/
			this.isVocAnalytics = true;
			this.isDebug = false;
			this.isStatus = true;

			/*editable*/
			let roles = ['admin', 'operator'];
			if(roles.indexOf(this.userRole) > -1) {
				this.isStatusEditable = true;
			} else {
				this.isStatusEditable = false;
			}

			// voc analytics
			if(roles.indexOf(this.userRole) > -1) {
				this.isVocAnalyticsEditable = true;
			} else {
				this.isVocAnalytics = false;
			}

			this.isDebugEditable = false;
		}
	}

	ngOnChanges() {
		this.destoryDynSubs();
		let fieldUrl = environment.APIS.SENSORTYPES;

		if(this.selectedSensor['csvUrl']) {
			const storageRef = firebase.storage().ref().child(this.selectedSensor['csvUrl']);
    		storageRef.getDownloadURL()
    			.then(url => {
    					this.selectedSensor['csvUrl'] = url;
    					this._purehttpService.	getCSVData(url).subscribe((data: any) => {
    						this.isChart = true;
    						this.nSelectedChartInd = 0;
    						this.isAdcCaled = false;
    						this.isCdcCaled = false;
    						this.isFloCaled = false;
    						this.csvData = data;
					    	this.checkCEAbility(this.nSelectedChartInd);
					    });
    				},
    				error =>  {
    					console.log('No CSV file in storage');
    					console.error(error);
    					this.selectedSensor['csvUrl'] = '';
    				});
		}

		this.sensorTypeSub = this._httpService.getAsObject(`${fieldUrl}/${this.selectedSensor.sensorTypeId}`).subscribe((sensorType) => {
			this.sensorType = sensorType;
			this.strSensorTypeName = (this.sensorType as any).typeName;
			this.changeStatus(0);
			this.isTypeLoading = true;
		}, error => {
			console.log(error);
			this._router.navigateByUrl('dashboard');
		});

		let sensorConfigUrl = environment.APIS.SENSORCONFIGS;

		this.configurationSub = this._httpService.getAsObject(`${sensorConfigUrl}/${this.sensorKey}`).subscribe((config) => {
			if(config) {
				this.configData = config;	
			} else {
				this.configData = null;
			}

			this.isGetConfig = true;
			
		}, error => {
			console.log(error);
		});
	}

	ngOnDestroy() {
		this.destoryDynSubs();

		if(this.adcChart) {
			this._amCharts.destroyChart(this.adcChart);	
		}
		
		if(this.cdcChart) {
			this._amCharts.destroyChart(this.cdcChart);
		}

		if(this.sensorActionSub) {
			this.sensorActionSub.unsubscribe();	
		}

		if(this.queryParamSub) {
			this.queryParamSub.unsubscribe();	
		}
	}

	destoryDynSubs() {
		if(this.sensorTypeSub) {
			this.sensorTypeSub.unsubscribe();	
		}

		if(this.configurationSub) {
			this.configurationSub.unsubscribe();	
		}
	}

	// check chart wrapper element ability
	checkCEAbility(nChartEleIndex: number, nRepeatCount: number = 0) {
		let arraTabEles = [this.adcTabElement, this.cdcTabElement, this.flowTabElement];
		let selectedTabEle = arraTabEles[nChartEleIndex];

		if(nRepeatCount > 100) {
			console.log('Timeout to wait for chart body element');
		} else if(!this.chartBodyElement || !selectedTabEle) {
			nRepeatCount ++;
			setTimeout(() => this.checkCEAbility(nChartEleIndex, nRepeatCount), 50);
		} else {
			if(!this.isAdcCaled && nChartEleIndex === 0) {
				this.buildAdcChart();
			}

			if(!this.isCdcCaled && nChartEleIndex === 1) {
				this.buildCdcChart();
			}

			if(!this.isFloCaled && nChartEleIndex === 2) {
				this.buildFloChart();
			}
		}
	}

	buildAdcChart() {
		let adcData = this.csvData.map(function(e) {
    		if(e['ADC Timestamps']) {
    			return {
	    			time: parseFloat(e['ADC Timestamps']),
	    			KP1: parseFloat(e['KP1']) < 1000 ? parseFloat(e['KP1']) : null,
	    			KP2: parseFloat(e['KP2']) < 1000 ? parseFloat(e['KP2']) : null,
	    			KP3: parseFloat(e['KP3']) < 1000 ? parseFloat(e['KP3']) : null,
	    			KP4: parseFloat(e['KP4']) < 1000 ? parseFloat(e['KP4']) : null,
	    			Column1: parseFloat(e['Column1']) < 1000 ? parseFloat(e['Column1']) : null,
	    			Column2: parseFloat(e['Column2']) < 1000 ? parseFloat(e['Column2']) : null,
	    			Column3: parseFloat(e['Column3']) < 1000 ? parseFloat(e['Column3']) : null,
	    			PCF: parseFloat(e['PCF']) < 1000 ? parseFloat(e['PCF']) : null,
	    			Injector: parseFloat(e['Injector']) < 1000 ? parseFloat(e['Injector']) : null
	    		};
    		} else {
    			return null;
    		}
    	}).filter((e) => {
    		return e;
    	});

    	this.adcChart = this._amCharts.makeChart("adcChartDiv", {
	    	type: "serial",
			theme: "light",
			pathToImages: "https://www.amcharts.com/lib/3/images/",
			dataProvider: adcData,
			valueAxes: [{
				gridColor: "#FFFFFF",
				gridAlpha: 0.2,
				dashLength: 0
			}],
			gridAboveGraphs: true,
			startDuration: 1,
			graphs: [{
				"title": "KP1",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"lineThickness": 2,
				"valueField": "KP1"
			}, {
				"title": "KP2",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"lineThickness": 2,
				"valueField": "KP2"
			}, {
				"title": "KP3",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"lineThickness": 2,
				"valueField": "KP3"
			}, {
				"title": "KP4",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"lineThickness": 2,
				"valueField": "KP4"
			}, {
				"title": "Column1",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"lineThickness": 2,
				"valueField": "Column1"
			}, {
				"title": "Column2",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"lineThickness": 2,
				"valueField": "Column2"
			}, {
				"title": "Column3",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"lineThickness": 2,
				"valueField": "Column3"
			}, {
				"title": "PCF",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"lineThickness": 2,
				"valueField": "PCF"
			}, {
				"title": "Injector",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"lineThickness": 2,
				"valueField": "Injector"
			}],
			chartCursor: {
				zoomable: false
			},
			categoryField: "time",
			categoryAxis: {
		        "gridPosition": "start",
		        "axisAlpha": 0,
		        "fillAlpha": 0.05,
		        "fillColor": "#000000",
		        "gridAlpha": 0
		    },
			mouseWheelScrollEnabled: true,
			mouseWheelZoomEnabled: true,
			legend: {
				useGraphSettings: true
			}
	    });

	    this.isAdcCaled = true;
	}

	buildCdcChart() {
		let cdcData = this.csvData.map(function(e) {
    		if(e['CDC Timestamps']) {
    			return {
	    			time: parseFloat(e['CDC Timestamps']),
	    			CapDET1: parseFloat(e['CapDET1']) < 1000 ? parseFloat(e['CapDET1']) : null,
	    			CapDET2: parseFloat(e['CapDET2']) < 1000 ? parseFloat(e['CapDET2']) : null
	    		};
    		} else {
    			return null;
    		}
    	}).filter((e) => {
    		return e;
    	});

		this.cdcChart = this._amCharts.makeChart("cdcChartDiv", {
		    type: "serial",
		    theme: "light",
		    pathToImages: "https://www.amcharts.com/lib/3/images/",
		    legend: {
		        "useGraphSettings": true
		    },
		    dataProvider: cdcData,
		    valueAxes: [{
		        "axisAlpha": 0
		    }],
		    startDuration: 0.5,
		    graphs: [{
				"title": "CapDET1",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"valueField": "CapDET1",
				"lineThickness": 2
			}, {
				"title": "CapDET2",
				"balloonText": "[[title]]: <b>[[value]]</b>",
				"lineThickness": 2,
				"valueField": "CapDET2"
			}],
		    chartCursor: {
		        "zoomable": false
		    },
		    categoryField: "time",
		    categoryAxis: {
		        "gridPosition": "start",
		        "axisAlpha": 0,
		        "fillAlpha": 0.05,
		        "fillColor": "#000000",
		        "gridAlpha": 0
		    },
		    mouseWheelScrollEnabled: true,
			mouseWheelZoomEnabled: true
		});

	    this.isCdcCaled = true;
	}

	buildFloChart() {
		this.isFloCaled = true;
	}

	onSelectTab(event: any) {
		this.checkCEAbility(event);
	}

	checkAction(currentStatus: string) {
		this.isAction = false;
		if(currentStatus === this.STATUSNAMES[0] && this.isStatusEditable) {
			this.isAction = true;
		}

		if(currentStatus === this.STATUSNAMES[1] && this.isVocAnalyticsEditable) {
			this.isAction = true;
		}

		if(currentStatus === this.STATUSNAMES[4] && this.isDebugEditable) {
			this.isAction = true;
		}		

		if(currentStatus === this.STATUSNAMES[2] || currentStatus === this.STATUSNAMES[3]) {
			this.isAction = true;
		}
	}

	changeStatus(statusIndex: number) {
		this._spinner.start();
		this.nActionNumber = statusIndex;
		this.isDataLoading = false;

		// get the category name for the button clicked currently
		let categoryName = this.STATUSNAMES[statusIndex];
		this.checkAction(categoryName);
		this.selectedSensorType = this.sensorType[categoryName];

		if(!this.selectedSensorType) {
			console.log('The sensor type of this sensor is not defined.');
			this._spinner.stop();
			return;
		}
		console.log(this.selectedSensorType);

		// get the table type of the sensor type
		let tableType;
		if(this.selectedSensorType.hasOwnProperty('tableType')) {
			tableType = this.selectedSensorType['tableType'];
		} else {
			console.log('The selected sensor category does not have table type property');
			return;
		}

		let url = environment.APIS.SENSORDATA;
		

		if(tableType === this.TABLETYPE[1]) { // header_row_type
			let sensorDetailQuery = {
				query: {
					orderByChild: 'timestamp',
					limitToLast: 1
				}
			};
			
			this.categorySub = this._httpService.getWithQuery(`${url}/${categoryName}/${this.selectedSensor.$key}/series`, sensorDetailQuery).subscribe(programs => {
				this.categorySub.unsubscribe();
				console.log(programs);
				this.isRowHeader = true;
				let values = programs.map((item) => {
					return item.value;
				});

				this.values = values[0];
				this.isDataLoading = true;
				
				this._spinner.stop();
		    },
		    error => {
		    	console.log(error);
		    });
		} else {// header_type
			let sensorDetailQuery = {
				query: {
					orderByChild: 'timestamp',
					limitToFirst: 10
				}
			};

			this.categorySub = this._httpService.getWithQuery(`${url}/${categoryName}/${this.selectedSensor.$key}/series`, sensorDetailQuery).subscribe(programs => {
				this.categorySub.unsubscribe();
				this.isRowHeader = false;
				this.values = programs.map((item) => {
					return item.value;
				});
				this.isDataLoading = true;
				this._spinner.stop();
		    },
		    error => {
		    	console.log(error);
		    });
		}
		
		if(this.selectedSensorType.hasOwnProperty('heads')) {
			this.isHeaderShow = true;
		} else {
			this.isHeaderShow = false;
		}

		if(this.selectedSensorType.hasOwnProperty('rows')) {
			this.isRowShow = true;
		} else {
			this.isRowShow = false;
		}
	}

	editValue(index: number) {
		this.nStatus = index;
		this.paramValue = this.selectedSensor[this.SENSOR_MAP[index-1]];
	}

	update() {
		let url = environment.APIS.SENSORS;
		if(!this.paramValue) {
			this.error = 'This field is required';
			return;
		}

		let updateValue = <any>{};
		updateValue[this.SENSOR_MAP[this.nStatus-1]] = this.paramValue;

		this._httpService.updateAsObject(`${url}/${(this.selectedSensor as any).$key}`, updateValue)
            .then(
                res  => {
                	this.clearEdit();
                	this._nofication.createNotification('success', 'Update', 'The sensor param updated successful!');
                },
                error =>  console.error(error));

        if(this.nStatus === 2) { // changing the address
        	this.getLatitudeLongitude(this.showResult, this);
        } else if(this.nStatus === 4) { // changing the latitude
        	this.getAddress(parseFloat(this.paramValue), parseFloat((this.selectedSensor as any).lng));
        } else if(this.nStatus === 5) { // changing the longtitude
        	this.getAddress(parseFloat((this.selectedSensor as any).lat), parseFloat(this.paramValue));
        }
	}

	cancel() {
		this.clearEdit();
	}

	clearEdit() {
		this.nStatus = 0;
		this.paramValue = '';
		this.error = '';
	}

	showResult(result: any, that: any) {
		let lat = result.geometry.location.lat();
		let lng = result.geometry.location.lng();
		lat = lat.toFixed(6);
		lng = lng.toFixed(6);

		// update latitude
		let url = environment.APIS.SENSORS;
		let updateValue: Object = {
			lat: lat
		};

		that._httpService.updateAsObject(`${url}/${(that.selectedSensor as any).$key}`, updateValue)
            .then(
                res  => {
                	console.log('The latitude is updated successfully.');
                },
                error =>  console.error(error));

        updateValue = {
			lng: lng
		};

		that._httpService.updateAsObject(`${url}/${(that.selectedSensor as any).$key}`, updateValue)
            .then(
                res  => {
                	console.log('The longtitude is updated successfully.');
                },
                error =>  console.error(error));
	}

	getLatitudeLongitude(callback, that) {
		let address = that.paramValue;
		if(address && address !== '') {
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
		} else {
			console.log('Address is required.');
		}
	}

	getAddress(lat: number, lng: number) {

		this._mapApiLoader.load().then(() => {
		    	let geocoder = new google.maps.Geocoder();
		    	let latlng = new google.maps.LatLng(lat, lng);
		    	let request = {latLng: latlng};

		    	geocoder.geocode(request, (results, status) => {
		    		if(status === google.maps.GeocoderStatus.OK) {
		    			let result = results[0];
		    			if(result !== null) {
		    				console.log(result.formatted_address);
			    			// update latitude
							let url = environment.APIS.SENSORS;
							let updateValue: Object = {
								address: result.formatted_address
							};

							this._httpService.updateAsObject(`${url}/${(this.selectedSensor as any).$key}`, updateValue)
					            .then(
					                res  => {
					                	this._nofication.createNotification('success', 'Update', 'The address updated successfully from lat and lng!');
					                },
					                error =>  console.error(error));
				        } else {
				        	this._nofication.createNotification('error', 'Update', 'The latitude and longtitude are not available.');
				        }
		    		}
		    	});
		    });
	}

	/**
	status - 0:online, 1:config, 2:start, 3:stop, 4:shut down, 5: offline
	**/
	controlSensorDevice(status: number) {
		if(status === 1) {
			this._configModalService.openDialog(this.configData, this._viewContainerRef)
				.then((dialog:DialogRef<ConfigModalContext>) => {				
					dialog.result.then((returnData: any) => {
						if(returnData) {
							let sensorConfigUrl = environment.APIS.SENSORCONFIGS;
							this._httpService.updateAsObject(`${sensorConfigUrl}/${this.sensorKey}`, returnData)
					            .then(
					                res  => {
					                	this.updateSensorDevice(status);
					                	console.log('The sensor is configured successfully.');
					                },
					                error =>  console.error(error));
						}
					});
				});
		} else {
			this.updateSensorDevice(status);
		}
	}

	// update sensorDevice status
	updateSensorDevice(status: number) {
		let sensorDeivceUrl = environment.APIS.SENSORDEVICES;
		let resVal = Math.random().toString(36).slice(-5);
		let updateValue = <any>{};
		updateValue['resVal'] = resVal;

		this._httpService.updateAsObject(`${sensorDeivceUrl}/${this.sensorKey}`, updateValue)
            .then(
                res  => {
                	console.log('ping to node.js server');
                	this.responseValue = '';
                	this.checkSensorDeviceResponse(status);
                },
                error =>  console.error(error));
	}

	// check real sensor device response
	checkSensorDeviceResponse(status: number) {
		let sensorDevicUrl = environment.APIS.SENSORDEVICES;
		let updateValue = <any>{};
		updateValue['actionStatus'] = status;

		this._httpService.updateAsObject(`${sensorDevicUrl}/${this.sensorKey}`, updateValue)
            .then(
                res  => {
                	console.log('The sensor device status is changed.');
            		this._spinner.start();
            		setTimeout(() => this.watchSensorDeviceResponse(), 5000);

            		this._httpService.getAsObject(`${sensorDevicUrl}/${this.sensorKey}/resVal`).take(2).subscribe((res) => {
						let value = 0;
						this.responseValue = (res as any).$value;
						this.responseValue = this.responseValue.toString();

						if(this.responseValue === environment['sensorResponse']) {
							console.log('response from node.js server');
							this._spinner.stop();
							
							if(!this.isDeviceOnline) {
								let updateValue = <any>{};
								updateValue['actionStatus'] = 0;

								this._httpService.updateAsObject(`${sensorDevicUrl}/${this.sensorKey}`, updateValue)
						            .then(
						                res  => {
						                	this._nofication.createNotification('info', 'Status', "Sensor device is now online");
						                },
						                error =>  console.error(error));
							} else {
								this._nofication.createNotification('success', 'Status', "This action is correctly applied.");	
							}
						}
					}, error => {
						console.log(error);
					});
                },
                error =>  console.error(error));
	}

	watchSensorDeviceResponse() {
		if(this.responseValue !== environment['sensorResponse']) {
			console.log('no response from node.js server!');
			this._nofication.createNotification('info', 'Sensor Device', "Sensor device isn't running at a moment");
			let sensorDevicUrl = environment.APIS.SENSORDEVICES;

			let updateValue = <any>{};
			updateValue['actionStatus'] = 5;

			this._httpService.updateAsObject(`${sensorDevicUrl}/${this.sensorKey}`, updateValue)
	            .then(
	                res  => {
	                	console.log('The sensor device availability is set to off');
	                	this._spinner.stop();
	                },
	                error =>  console.error(error));
		}
	}
}
