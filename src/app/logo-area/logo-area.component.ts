import { Component,
	OnInit,
	Input
} from '@angular/core';
import { DataService } from '../service/data.service';

@Component({
	selector: 'component-logo-area',
	templateUrl: './logo-area.component.html',
	styleUrls: ['./logo-area.component.scss']
})
export class LogoAreaComponent implements OnInit {
	@Input() title;

	constructor(private _dataService: DataService) {
	}

	ngOnInit() {
	}

}
