import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'sensortypeDetail'
})
export class SensortypeDetailPipe implements PipeTransform {

	transform(value: any, args?: any): any {
		if(value[0] === 'option') {
			return value[1].join('/');
		} else {
			return value[0];
		}
	}

}
