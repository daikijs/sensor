import { Component, OnInit } from '@angular/core';
import { DataService } from '../../service/data.service';

@Component({
  selector: 'component-sensor-topbar',
  templateUrl: './sensor-topbar.component.html',
  styleUrls: ['./sensor-topbar.component.scss']
})
export class SensorTopbarComponent implements OnInit {

	constructor(private _dataService: DataService) {
	}

	ngOnInit() {
	}

}
