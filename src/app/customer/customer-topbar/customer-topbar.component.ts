import { Component,
	OnInit,
	Input,
	Output,
	EventEmitter } from '@angular/core';

@Component({
  selector: 'component-customer-topbar',
  templateUrl: './customer-topbar.component.html',
  styleUrls: ['./customer-topbar.component.scss']
})
export class CustomerTopbarComponent implements OnInit {
	@Input() status: number;
	@Output() getTabEven = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
		//this.getTabEven.emit(this.type);
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
