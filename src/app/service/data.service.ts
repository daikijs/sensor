import { Injectable } from '@angular/core';

@Injectable()
export class DataService {

	constructor() { }

	setData(name: string, data: any) {
		localStorage.setItem(name, JSON.stringify(data));
	}

	getData(name: string) {
		let data = localStorage.getItem(name);
		return JSON.parse(data);
	}

	saveString(name: string, value: string) {
		localStorage.setItem(name, value);
	}

	getString(name: string) {
		return localStorage.getItem(name);
	}

}
