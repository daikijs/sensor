import { Component,
	OnInit } from '@angular/core';
import { Router,
	ActivatedRoute } from '@angular/router';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
	createType: number;

	typeString: string;
	title: string;
	customerId: string;
	zoneId: string;
	createName: string;

	constructor(
		private _dataService: DataService,
		private route: ActivatedRoute
	) {
		this.createType = -1; //0: customer, 1: sensor, 2: zone
	}

	ngOnInit() {
		// get URL parameters
	    this.route
	        .params
	        .subscribe(params => {
	            // Récupération des valeurs de l'URL
	            this.typeString = params['name']; // --> Name must match wanted paramter
	            
	            if(this.typeString === 'newCustomer') {
	            	this.createType = 0;
	            	this.title = 'Customer';
	            } else if(this.typeString === 'newZone') {
	            	this.createType = 1;
	            	this.title = 'Zone';
	            } else  if(this.typeString === 'newSensor') {
	            	this.createType = 2;
	            	this.title = 'Sensor';
	            } else {
	            	this.createType = -1;
	            }
	    });

	    this.route
	        .queryParams
	        .subscribe(params => {
	        	this.createName = params['create'];
	        	this.customerId = params['customerId'];
	        	this.zoneId = params['zoneId'];
	    });
	}

}
