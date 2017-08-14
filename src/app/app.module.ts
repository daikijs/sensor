import { BrowserModule }             from '@angular/platform-browser';
import { NgModule }                  from '@angular/core';
import { HttpModule }                from '@angular/http';
import { RouterModule, Routes }      from '@angular/router';
import { AngularFireModule }         from 'angularfire2';
import { AgmCoreModule,
GoogleMapsAPIWrapper }               from 'angular2-google-maps/core';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { ModalModule }               from 'angular2-modal';
import { BootstrapModalModule }      from 'angular2-modal/plugins/bootstrap';
import { Ng2PaginationModule }       from 'ng2-pagination';
import { Ng2SmartTableModule }       from 'ng2-smart-table';
import { ColorPickerModule }         from 'angular2-color-picker';
import { DataTableModule }           from 'angular2-datatable';
import { MaterialModule }            from '@angular/material';
import { FormWizardModule }          from 'angular2-wizard';
import { AmChartsModule }            from "amcharts3-angular2";
import { FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import 'hammerjs';

import { AuthService }         from './service/auth.service';
import { HttpService }         from './service/http.service';
import { DataService }         from './service/data.service';
import { NotificationService } from './service/notification.service';
import { AuthguardService }    from './service/authguard.service';
import { EventService }        from './service/event.service';
import { PurehttpService }     from './service/purehttp.service';
import { SpinnerService }      from './service/spinner.service';
import { ConfigModalService }  from './modal/config-modal/config-modal.service';
import { ConfirmModalService } from './modal/confirm-modal/confirm-modal.service';
import { UserModalService }    from './modal/user-modal/user-modal.service';
import { AmChartsService }     from "amcharts3-angular2";

import { CountColorPipePipe }   from './filter/count-color-pipe.pipe';
import { RemainderPipe }        from './filter/remainder.pipe';
import { AdminContentPipe }     from './filter/admin-content.pipe';
import { SensortypeDetailPipe } from './filter/sensortype-detail.pipe';
import { DataFilterPipe }       from './filter/data-filter.pipe';
import { PendingFilterPipe }    from './filter/pending-filter.pipe';
import { NameFilterPipe }       from './filter/name-filter.pipe';

import { firebaseConfig }      from '../environments/firebase.config';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { TopBarComponent } from './top-bar/top-bar.component';

import { CreateComponent }         from './create/create.component';
import { CreateCustomerComponent } from './create/create-customer/create-customer.component';
import { CreateZoneComponent }     from './create/create-zone/create-zone.component';
import { CreateSensorComponent }   from './create/create-sensor/create-sensor.component';

import { CustomerComponent }       from './customer/customer.component';
import { CustomerTopbarComponent } from './customer/customer-topbar/customer-topbar.component';
import { CustomerMapComponent }    from './customer/customer-map/customer-map.component';
import { CustomerListComponent }   from './customer/customer-list/customer-list.component';
import { CustomerDetailComponent } from './customer/customer-detail/customer-detail.component';

import { ZoneComponent }       from './zone/zone.component';
import { ZoneTopbarComponent } from './zone/zone-topbar/zone-topbar.component';
import { ZoneMapComponent }    from './zone/zone-map/zone-map.component';
import { ZoneListComponent }   from './zone/zone-list/zone-list.component';
import { ZoneDetailComponent } from './zone/zone-detail/zone-detail.component';

import { SensorComponent }           from './sensor/sensor.component';
import { SensorDetailComponent }     from './sensor/sensor-detail/sensor-detail.component';
import { SensorTopbarComponent }     from './sensor/sensor-topbar/sensor-topbar.component';
import { SensorTypeComponent }       from './sensor/sensor-type/sensor-type.component';
import { SensorTypeTopbarComponent } from './sensor/sensor-type-topbar/sensor-type-topbar.component';
import { SensorTypeDetailComponent } from './sensor/sensor-type-detail/sensor-type-detail.component';
import { SensorTypeInfoComponent }   from './sensor/sensor-type-info/sensor-type-info.component';

import { SignUpComponent } from './sign-up/sign-up.component';
import { AdminComponent } from './admin/admin.component';
import { ConfigModalComponent } from './modal/config-modal/config-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal/confirm-modal.component';
import { UserModalComponent } from './modal/user-modal/user-modal.component';
import { SensorTypeCategoryComponent } from './component/sensor-type-category/sensor-type-category.component';


import { LogoAreaComponent } from './logo-area/logo-area.component';
import { SpinnerComponent } from './spinner/spinner.component';


const appRoutes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full'},
    { path: 'login', component: LoginComponent },
    { path: 'dashboard',
        component: DashboardComponent
    },
    { path: 'customer',
        component: CustomerComponent,
        canActivate: [AuthguardService],
        data: {types: ['staff'],
            roles: ['admin', 'debugger', 'operator', 'viewer']
        }
    },
    { path: 'customer_detail/:id', component: CustomerDetailComponent },
    { path: 'zone',
        component: ZoneComponent,
        canActivate: [AuthguardService],
        data: {types: ['staff'],
            roles: ['admin', 'debugger', 'operator', 'viewer']
        }
    },
    { path: 'zone_detail/:id', component: ZoneDetailComponent },
    { path: 'sensor/:id', component: SensorComponent },
    { path: 'sensor_type', component: SensorTypeComponent },
    { path: 'create/:name', component: CreateComponent },
    { path: 'sign_up', component: SignUpComponent },
    { path: 'sensor_type_info/:id', component: SensorTypeInfoComponent },
    { path: ':customId/login', component: LoginComponent },
    { path: ':customId/dashboard', component: DashboardComponent },
    { path: ':customId/zone',
        component: ZoneComponent,
        canActivate: [AuthguardService]
    },
    { path: ':customId/sensor_type', component: SensorTypeComponent },
    { path: ':customId/sign_up', component: SignUpComponent },
    { path: 'admin',
        component: AdminComponent,
        canActivate: [AuthguardService],
        data: {roles: ['admin']}
    },
    { path: ':customId/admin',
        component: AdminComponent,
        canActivate: [AuthguardService],
        data: {roles: ['admin']}
    }
];

@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        LoginComponent,
        TopBarComponent,
        ZoneComponent,
        CustomerComponent,
        CustomerTopbarComponent,
        CustomerMapComponent,
        CustomerListComponent,
        ZoneTopbarComponent,
        SensorComponent,
        ZoneTopbarComponent,
        ZoneMapComponent,
        ZoneListComponent,
        SensorDetailComponent,
        SensorTopbarComponent,
        SensorTypeComponent,
        SensorTypeTopbarComponent,
        SensorTypeDetailComponent,
        CreateCustomerComponent,
        CreateZoneComponent,
        CreateSensorComponent,
        CreateComponent,
        CountColorPipePipe,
        RemainderPipe,
        AdminContentPipe,
        SignUpComponent,
        AdminComponent,
        ConfigModalComponent,
        ConfirmModalComponent,
        UserModalComponent,
        AdminContentPipe,
        SensorTypeCategoryComponent,
        SensorTypeInfoComponent,
        SensortypeDetailPipe,
        ZoneDetailComponent,
        LogoAreaComponent,
        CustomerDetailComponent,
        DataFilterPipe,
        PendingFilterPipe,
        NameFilterPipe,
        SpinnerComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule.forRoot(appRoutes, {useHash: true}),
        AngularFireModule.initializeApp(firebaseConfig),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyBGH1Lmb_8OPJnadWq39AUglhyULkY8HZU'
        }),
        SimpleNotificationsModule.forRoot(),
        ModalModule.forRoot(),
        BootstrapModalModule,
        Ng2PaginationModule,
        Ng2SmartTableModule,
        ColorPickerModule,
        DataTableModule,
        MaterialModule.forRoot(),
        FormWizardModule,
        AmChartsModule
    ],
    providers: [
       AuthService,
       HttpService,
       DataService,
       NotificationService,
       AuthguardService,
       ConfigModalService,
       ConfirmModalService,
       UserModalService,
       GoogleMapsAPIWrapper,
       EventService,
       SpinnerService,
       PurehttpService,
       AmChartsService
    ],
    entryComponents: [
        ConfigModalComponent,
        ConfirmModalComponent,
        UserModalComponent
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
