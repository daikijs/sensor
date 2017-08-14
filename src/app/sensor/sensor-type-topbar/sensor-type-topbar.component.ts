import { Component, OnInit } from '@angular/core';
import { DataService } from '../../service/data.service';

@Component({
	selector: 'component-sensor-type-topbar',
	templateUrl: './sensor-type-topbar.component.html',
	styleUrls: ['./sensor-type-topbar.component.scss']
})
export class SensorTypeTopbarComponent implements OnInit {

	constructor(private _dataService: DataService) {
	}

	ngOnInit() {
	}

}
