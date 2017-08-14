import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'countColorPipe'
})
export class CountColorPipePipe implements PipeTransform {
	transform(value: any, args?: any): any {
		if(parseInt(value) > 0) {
  			return true;
  		} else {
  			return false;
  		}
	}
}
