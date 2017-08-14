import { Injectable }                              from '@angular/core';
import { AngularFire, AuthProviders, AuthMethods } from "angularfire2";
import { NotificationService }                     from './notification.service';
import { HttpService }                             from './http.service';
import { DataService }                             from './data.service';
import { Router }                                  from '@angular/router';
import { Observable }                              from "rxjs/Rx";

@Injectable()
export class AuthService {
    config = {
        provider: AuthProviders.Custom,
        method: AuthMethods.Password
    }

    loginCreential = {

    };

    constructor(
        public af: AngularFire,
        private _httpService: HttpService,
        private _dataService: DataService,
        private _nofication: NotificationService,
        private _router: Router
    ) {
    }

    checkLoginStatus() {
        let that = this;
        let res: Promise<boolean> = new Promise((resolve, reject) => {
            this.af.auth.subscribe(user => {
                resolve(user);
            });
        });
        return res;
    }

    signUp(email: string, password: string) {
        let creds = { email: email, password: password};
        let that = this;
        return new Promise((resolve, reject) => {
            this.af.auth.createUser(creds)
                .then(result => {
                    resolve(result);
                })
                .catch((ex) => {
                    that.errorHandle(ex);
                });
        });
    }

    login(email: string, password: string) {
        let creds = { email: email, password: password};
        let that = this;
        return new Promise((resolve, reject) => {
            this.af.auth.login(creds, this.config)
                .then(result => {
                    resolve(result);
                })
                .catch((ex) => {
                    that.errorHandle(ex);
                });
        });
    }


    logout() {
        let that = this;
        return new Promise((resolve, reject) => {
           this.af.auth.logout()
                .then(result => {
                   resolve(1);
                })
               .catch(ex => {
                   that.errorHandle(ex);
               });
        });
    }

    errorHandle(ex) {
        console.log('Error is occur: ');
        console.log(ex);

        this._nofication.createNotification('error', 'Authentication Error', ex.message);
    }

}
