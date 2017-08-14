import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'remainder'
})
export class RemainderPipe implements PipeTransform {

	transform(value: any, args?: any): any {
		return (parseInt(value[1]) - parseInt(value[0]));
	}

}
