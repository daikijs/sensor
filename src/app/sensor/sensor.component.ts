import { Component,
	OnInit,
	ElementRef,
	ViewChild,
	OnDestroy
} from '@angular/core';
import { environment }    from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService }    from '../service/http.service';

@Component({
  selector: 'component-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.sass']
})
export class SensorComponent implements OnInit, OnDestroy {
	isPageLoading: boolean;

	mainAreaH: number;
	selectedSensor: Object;
	sensorKey: string;

	sensorSub: any;

	@ViewChild('sensorTopBarScreen') sensorTopBarScreen: ElementRef;

	constructor(
		private element: ElementRef,
		private _httpService: HttpService,
		private _router: Router,
		private _activeRoute: ActivatedRoute
	) {
		this.isPageLoading = false;	
	}

	ngOnInit() {
		this.mainAreaH = window.innerHeight - this.sensorTopBarScreen.nativeElement.offsetHeight;

		this._activeRoute.params.subscribe(params => {
			this.sensorKey = params['id']; console.log(this.sensorKey);
			let url = environment.APIS.SENSORS;
			this.sensorSub = this._httpService.getAsObject(`${url}/${this.sensorKey}`).subscribe(sensor => {
				console.log(sensor);
				this.selectedSensor = sensor;
				this.isPageLoading = true;
			},
			error => {
				console.log(error);
			});
		});
	}

	ngOnDestroy() {
		if(this.sensorSub) {
			this.sensorSub.unsubscribe();
		}
	}

}
