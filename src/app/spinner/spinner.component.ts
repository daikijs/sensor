import { Component, OnInit } from '@angular/core';
import { SpinnerService }    from '../service/spinner.service';

@Component({
	selector: 'component-spinner',
	templateUrl: './spinner.component.html',
	styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
	active: boolean;

	constructor(private spinner: SpinnerService) {
		spinner.status.subscribe((status: boolean) => {
			this.active = status;
		});
	}

	ngOnInit() {
	}

}
