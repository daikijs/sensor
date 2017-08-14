import {
	Component,
	ViewChild,
	ElementRef,
	OnInit,
	AfterContentChecked
} from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterContentChecked {
	options = {
	            timeOut: 3000,
	            clickToClose: true,
	            pauseOnHover: true,
	            animate: 'scale',
	            position: ['right', 'top']
	        };

	@ViewChild('headerHandler') headerHandler: ElementRef;
	nBdyHeight: number; // body height

	constructor() {
		console.log(environment);
		this.nBdyHeight = 0;
	}

	ngOnInit() {
	}

	ngAfterContentChecked() {
		this.setBody();
	}

	setBody(nCounter: number = 0) {
		if(this.headerHandler) {
			let wndHeight = window.innerHeight;
			this.nBdyHeight = wndHeight - this.headerHandler.nativeElement.offsetHeight;
		}
	}
}
