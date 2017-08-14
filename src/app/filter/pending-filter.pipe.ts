import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pendingFilter'
})
export class PendingFilterPipe implements PipeTransform {

	transform(array: any[], args?: any): any {
		array = array.filter((item) => {
			return item.status === 'pending';
		});

		return array.length;
	}

}
