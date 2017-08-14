import { Component,
	OnInit,
	Input,
	Output,
	EventEmitter } from '@angular/core';

@Component({
	selector: 'component-zone-topbar',
	templateUrl: './zone-topbar.component.html',
	styleUrls: ['./zone-topbar.component.scss']
})
export class ZoneTopbarComponent implements OnInit {
	@Input() status: number;
	@Output() getTabEven = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
	}

	gotoMap() {
		this.status = 0;
		this.getTabEven.emit(this.status);
	}

	gotoList() {
		this.status = 1;
		this.getTabEven.emit(this.status);
	}

}

