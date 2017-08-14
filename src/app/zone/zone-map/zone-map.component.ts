import { Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ElementRef,
	ViewChild } from '@angular/core';
import { HttpService } from '../../service/http.service';

@Component({
  selector: 'component-zone-map',
  templateUrl: './zone-map.component.html',
  styleUrls: ['./zone-map.component.scss']
})
export class ZoneMapComponent implements OnInit {
	zones: Object[];
	paths: any[];
	positions: any[];

	nCenterLat: number;
	nCenterLng: number;

	@Input() zoneObjects: any[];
	@Input() centerCoordinate: Object;
	@Output() gotoSensorStatus = new EventEmitter();

	@ViewChild('mapWrap') mapWrap: ElementRef;

	constructor(private el:ElementRef) {
	}

	ngOnInit() {
		this.positions = [];
    	this.paths = [];
    	let sensors = [];

    	for(let i=0; i<this.zoneObjects.length; i++) {
    		sensors = [];
    		let icon = this.pinSymbol(this.zoneObjects[i].color);

    		for (var key in this.zoneObjects[i].sensors) {
    			let sensor = this.zoneObjects[i].sensors[key];

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
    				zoneColor: (this.zoneObjects[i] as any).color
		    	});
    		}

    		this.generateAllLines(sensors);
    	}
    	
    	this.setCenterCoodinate();
		this.getMapHeight();
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

	// generate the connections of all lines
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
	}

	// generate the pin with background color
	pinSymbol(color: string) {
	    return {
	        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
	        fillColor: color,
	        fillOpacity: 1,
	        strokeColor: '#000',
	        strokeWeight: 2,
	        scale: 1,
	   };
	}
}
