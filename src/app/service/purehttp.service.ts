import { Injectable } from '@angular/core';
import {
	Http,
	Response,
	Headers,
	RequestOptions,
	URLSearchParams
} from '@angular/http';
import {Observable} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class PurehttpService {

	constructor(private http: Http) {
	}

	updateData(actionUrl: string, body: Object) {
		let bodyString = JSON.stringify(body); // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options    = new RequestOptions({ headers: headers }); // Create a request option
        let serverUrl = 'http://localhost:3000';
        serverUrl += actionUrl;

        return this.http.post(serverUrl, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch((error:any) => Observable.throw(error.json().error || 'Server error')); //...errors if any
	}

	// get csv data from node api
	getCSVData(url: string) {
		let data = new URLSearchParams();
		data.append('url', url);
		return this.http.post('/api', data)
    		.map((res:Response) => res.json())
    		.catch((error:any) => Observable.throw(error.json().error || 'Server error'));
	}

}
