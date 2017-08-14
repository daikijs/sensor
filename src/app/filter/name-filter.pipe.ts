import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'nameFilter'
})
export class NameFilterPipe implements PipeTransform {

	transform(array: any[], id: string, returnKey: string): any {
		array = array.filter((item) => {
			return item.id === id;
		});

		return array[0][returnKey];
	}

}
