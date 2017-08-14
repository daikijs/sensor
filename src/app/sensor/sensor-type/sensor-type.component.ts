import { Component,
	OnInit,
	ElementRef,
	ViewChild,
	AfterContentChecked
} from '@angular/core';

@Component({
  selector: 'app-sensor-type',
  templateUrl: './sensor-type.component.html',
  styleUrls: ['./sensor-type.component.scss']
})
export class SensorTypeComponent implements OnInit, AfterContentChecked {
	nMAHeight: number;

	@ViewChild('sensorTypeTopBarScreen') sensorTypeTopBarScreen: ElementRef;
	@ViewChild('sensorTMAScreen') sensorTMAScreen: ElementRef;

	constructor(private element: ElementRef) {
		
	}

	ngOnInit() {
		
	}

	ngAfterContentChecked() {
		this.setMainHeight();
	}

	setMainHeight(count: number = 0) {
		if(count > 50) {
			console.log('Timeout!');
		} else if(!this.sensorTypeTopBarScreen
			|| this.sensorTMAScreen.nativeElement.offsetHeight === 0
			|| this.sensorTypeTopBarScreen.nativeElement.offsetHeight === 0) {
			count ++;
			setTimeout(()=>this.setMainHeight(count), 100);
		} else {
			this.nMAHeight = this.sensorTMAScreen.nativeElement.offsetHeight - this.sensorTypeTopBarScreen.nativeElement.offsetHeight;
		}
	}
}
