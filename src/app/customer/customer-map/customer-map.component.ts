import { Component,
	OnInit,
	Input,
	Output,
	ElementRef,
	ViewChild,
	EventEmitter
} from '@angular/core';
import { HttpService } from '../../service/http.service';

@Component({
  selector: 'component-customer-map',
  templateUrl: './customer-map.component.html',
  styleUrls: ['./customer-map.component.scss']
})
export class CustomerMapComponent {
	isLoading: boolean;

	@Input() customers: any[];
	@Input() zones: any[];
	@Input() centerCoordinate: Object;
	@Output() gotoSensorStatus = new EventEmitter();
	paths: any[];
	pos = [];

	nCenterLat: number;
	nCenterLng: number;

	@Input() windowH: number;
	@ViewChild('mapWrap') mapWrap: ElementRef;
	positions = [];
	pathObjects: Object[];
	symbol: google.maps.Symbol;

	constructor(private el:ElementRef,
		private _httpService: HttpService) {
	}

	ngOnInit() {
		this.isLoading = true;
		this.pathObjects = [];
		this.positions = [];
		this.paths = [];

		for(let i=0; i<this.zones.length; i++) {
			let zone = this.zones[i];
			let sensors = [];
			let color = this.getCustomerColor((zone as any).customerId);
			console.log('color: ' +  color);
			let icon = this.pinSymbol(color);

	  		for (var key in zone.sensors) {
    			let sensor = zone.sensors[key];

    			this.positions.push(
    			{
    				position: [parseFloat(sensor.lat), parseFloat(sensor.lng)],
    				icon: icon,
    				customerKey: sensor.customerId,
    				zoneKey: sensor.zoneId,
    				sensorKey: sensor.$key
    			});

    			sensors.push({
		    		lat: parseFloat(sensor.lat),
		    		lng: parseFloat(sensor.lng),
		    		customerKey: sensor.customerId,
    				zoneKey: sensor.zoneId,
    				zoneColor: (zone as any).color
		    	});
    		}

    		this.generateAllLines(sensors);
		}
		
		this.setCenterCoodinate();
		this.getMapHeight();
	}

	ngOnChanges() {
		
	}

	setCenterCoodinate() {
		if(this.centerCoordinate) {
			if((this.centerCoordinate as any).lat && (this.centerCoordinate as any).lng) {
				this.nCenterLat = parseFloat((this.centerCoordinate as any).lat);
				this.nCenterLng = parseFloat((this.centerCoordinate as any).lng);
			} else {
				this.nCenterLat = 43.75334648880996;
				this.nCenterLng = -79.7818144581418;
			}
		} else {
			this.nCenterLat = 43.75334648880996;
			this.nCenterLng = -79.7818144581418;
		}
	}

	// get customer color with zone Object
	getCustomerColor(customerKey: string) {
		let color;

		for(let i=0; i<this.customers.length; i++) {
			if(customerKey === (this.customers[i] as any).$key) {
				color = (this.customers[i] as any).color;
				break;
			}
		}

		return color;
	}

	// click the sensor marker
	clickMarker(customerKey: string, zoneKey: string, sensorKey: string) {
		this.gotoSensorStatus.emit({customerKey: customerKey,
			zoneKey: zoneKey,
			sensorKey: sensorKey});
	}

	// click the line in google map
	clickLine(customerKey: string, zoneKey: string) {
		this.gotoSensorStatus.emit({customerKey: customerKey,
			zoneKey: zoneKey});
	}

	// connect between two lines
	generateAllLines(arrLine: any[]) {
		for(let i=0; i<arrLine.length; i++) {
			for(let j=i; j<arrLine.length; j++) {
				this.paths.push([
						{
							lat: parseFloat(arrLine[i].lat),
			    			lng: parseFloat(arrLine[i].lng),
			    			customerKey: arrLine[i].customerKey,
    						zoneKey: arrLine[i].zoneKey,
    						zoneColor: arrLine[i].zoneColor
						},
						{
							lat: parseFloat(arrLine[j].lat),
			    			lng: parseFloat(arrLine[j].lng)
						}
					]);
			}
		}
	}

	/*
	get map wrap height
	*/
	getMapHeight() {
		let marginTopElement = this.mapWrap.nativeElement;
		var marginWrapStyle = marginTopElement.currentStyle || window.getComputedStyle(marginTopElement);
		this.windowH -= parseInt(marginWrapStyle.marginTop) * 2;
	}

	// generate the pin with background color
	pinSymbol(color: string) {
	    return {
	        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
	        fillColor: color,
	        fillOpacity: 1,
	        strokeColor: '#000',
	        strokeWeight: 2,
	        scale: 1
	   };
	}

	showRandomMarkers() {
	    let randomLat: number, randomLng: number;
	    this.pos = [];
	    for (let i = 0 ; i < 3; i++) {
	    	randomLat = Math.random() * 0.0099 + 43.7540;
	    	randomLng = Math.random() * 0.0099 + -79.7459;
	    	this.pos.push([randomLat, randomLng]);
	    }
	}
}
