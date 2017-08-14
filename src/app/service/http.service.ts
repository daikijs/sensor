import { Injectable } from '@angular/core';
import { AngularFire } from "angularfire2";
import { Observable } from "rxjs/Rx";
import { NotificationService } from './notification.service';

@Injectable()
export class HttpService {

	constructor(public af: AngularFire,
        private _nofication: NotificationService) {

	}

	getAsList(url: string):Observable<any[]> {
        return this.af.database.list(url);
    }

    getWithQuery(url: string, query: Object):Observable<any[]> {
        return this.af.database.list(url, query);
    }

    getAsObject(url: string):Observable<any> {
        return this.af.database.object(url);
    }

    postAsObject(url: string, value: any):Promise<any> {
        return new Promise((resolve, reject) => {
            this.af.database.object(url).set(value)
                .then(res => {
                    resolve(1);
                })
                .catch(this.errorHandle);
        });
    }

    createAsList(url: string, value: any):Promise<any> {
        return new Promise((resolve, reject) => {
            this.af.database.list(url).push(value)
                .then(res => {
                    resolve(res);
                })
                .catch(this.errorHandle);
        });
    }

    updateAsObject(url: string, value: any):Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.af.database.object(url).update(value)
                .then(res => {
                    resolve(1);
                })
                .catch(this.errorHandle);
        });
    }

    deleteAsObject(url: string):Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.af.database.object(url).remove()
                .then(res => {
                    resolve(1);
                })
                .catch(this.errorHandle);
        });
    }

    errorHandle(error: any) {
        console.log(error);
        return 0;
    }

}
