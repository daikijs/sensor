import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'adminContent'
})
export class AdminContentPipe implements PipeTransform {

  transform(value: any, args?: any): any {
  	let displays =[
  		'Administrator',
  		'Developer',
  		'Debug Operator',
  		'Operator',
  		'Viewer',
  		'Public',
  		'Omniscent Staff',
  		'Customer',
      'Pending',
      'Approved'
  	];

  	let values = [
  		'admin',
  		'developer',
  		'debugger',
  		'operator',
  		'viewer',
  		'public',
  		'staff',
  		'customer',
      'pending',
      'approved'
  	];

  	let index = values.indexOf(value);
    return displays[index];
  }

}
