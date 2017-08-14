import { Component,
	OnInit,
	ViewChild
} from '@angular/core';
import { FormGroup,
	FormBuilder,
	Validators,
	FormControl,
	ValidatorFn,
	AbstractControl
} from '@angular/forms';
import { environment }               from '../../../environments/environment';
import { DialogRef, ModalComponent } from 'angular2-modal';
import { ConfigModalContext }        from './config-modal.context';
import { AuthService }               from '../../service/auth.service';
import { HttpService }               from '../../service/http.service';
import { NotificationService }       from '../../service/notification.service';

@Component({
	selector: 'app-config-modal',
	templateUrl: './config-modal.component.html',
	styleUrls: ['./config-modal.component.scss']
})
export class ConfigModalComponent implements ModalComponent<ConfigModalContext> ,OnInit {
	deltaForm: FormGroup;
	fracDeltaForm: FormGroup;
	absoluteForm: FormGroup;
    numberForm: FormGroup;
    context: ConfigModalContext;
    configTypes = ['Absolute', 'Delta', 'Frac_Delta'];
    asIData: Object; // absolute init data
    dtIData: Object; // dtIData init data
    fdIData: Object; // fdIData init data

    currentType: string;
    errorAlert: string;

    nCurrentStep: number;
    nInvalidStep: number;
    nStepNumber: number;
    arrayParams: Object[];


	constructor(public dialog: DialogRef<ConfigModalContext>) {
        this.context = dialog.context;
        console.log(this.context);
        this.currentType = this.configTypes[0];
        this.nCurrentStep = -1;
        this.nInvalidStep = -1;
        this.nStepNumber = 0;

        this.errorAlert = '';
        this.arrayParams = [];
	}

    nextStep() {
        let data: any;
        
        if(this.nCurrentStep === 1) {
            let stepNumber =1;
            let runNumber =1;
            this.arrayParams = [];

            if((this.context as any).configData.hasOwnProperty(this.currentType)) {
                data = (this.context as any).configData[this.currentType];
                stepNumber = (data as any)['Num_of_Step'];
                runNumber = (data as any)['Num_of_Cycle'];
                
            }

            this.numberForm.controls['stepNumber'].setValue(stepNumber);
            this.numberForm.controls['runNumber'].setValue(runNumber);
        }

        if(this.nCurrentStep === 2) {
            let nStepNumber = parseInt(this.numberForm['value']['stepNumber']);
            // initial save params when changing the step number and then number is not firebase step value
            if(data) {
                if((data as any)['Num_of_Step'] !== nStepNumber) {
                    this.arrayParams = [];    
                }
            } else {
                if(this.nStepNumber !== nStepNumber) {
                    this.arrayParams = [];    
                }
            }

            this.nStepNumber = nStepNumber;
        }

        if(this.nCurrentStep>2 && this.nCurrentStep<=(this.nStepNumber+2)) {
            let nStep = this.nCurrentStep - 3;
            let data: any;

            switch (this.currentType) {
                case this.configTypes[0]:
                    data = this.absoluteForm['value'];
                    break;
                
                case this.configTypes[1]:
                    data = this.deltaForm['value'];
                    break;

                case this.configTypes[2]:
                    data = this.fracDeltaForm['value'];
                    break;
            }

            this.arrayParams[nStep] = data;
        }

        this.getAllParams();

        this.nCurrentStep ++;
    }

    getAllParams() {

        if(this.nCurrentStep > 1 && this.nCurrentStep<(this.nStepNumber+2)) {
            let params = null;
            if((this.context as any).configData.hasOwnProperty(this.currentType)) {
                let data = (this.context as any).configData[this.currentType];

                if( (data as any)['Num_of_Step'] === this.numberForm['value']['stepNumber']) {
                    let nInd = this.nCurrentStep -1;
                    let keyName = `Step${nInd}_Config`;

                    if((data as any)['Mode_Config'].hasOwnProperty(keyName)) {
                        params = (data as any)['Mode_Config'][keyName];
                    }
                }
            }

            if(!params) {
                switch (this.currentType) {
                    case this.configTypes[0]:
                        params = this.asIData;
                        break;
                    
                    case this.configTypes[1]:
                        params = this.dtIData;
                        break;

                    case this.configTypes[2]:
                        params = this.fdIData;
                        break;
                }
            }

            let nStep = this.nCurrentStep - 2;

            if(this.arrayParams[nStep]) {
                this.setFormParam(this.arrayParams[nStep]);
            } else {
                this.setFormParamFromApi(params);
            }
        }
    }

    previousStep() {

        if(this.nCurrentStep>2 && this.nCurrentStep<=(this.nStepNumber+2)) {
            let nStep = this.nCurrentStep - 3;
            let data: any;

            switch (this.currentType) {
                case this.configTypes[0]:
                    data = this.absoluteForm['value'];
                    break;
                
                case this.configTypes[1]:
                    data = this.deltaForm['value'];
                    break;

                case this.configTypes[2]:
                    data = this.fracDeltaForm['value'];
                    break;
            }
            this.arrayParams[nStep] = data;
        }

        if(this.nCurrentStep > 3) {
            let nStep = this.nCurrentStep - 4;
            this.setFormParam(this.arrayParams[nStep]);
        }

        let that = this;
        setTimeout(() => {
            that.nCurrentStep --;    
        }, 100);
    }

    submitParams() {
        let submitData = {
            Mode_Type: this.currentType,
            Num_of_Step: this.numberForm['value']['stepNumber'],
            Num_of_Cycle: this.numberForm['value']['runNumber'],
            Mode_Config: null
        };

        let paramData = <any>{};
        for(let i=0; i<this.nStepNumber; i++) {
            let strKeyLabel = `Step${i+1}_Config`;
            let data = this.arrayParams[i];
            switch (this.currentType) {
                case this.configTypes[0]:
                    paramData[strKeyLabel] = {
                        KP1: {
                            tIdle: (data as any)['kp1TIdle'],
                            tTarget: (data as any)['kp1TTarget'],
                            t1: (data as any)['kp1T1'],
                            t2: (data as any)['kp1T2'],
                            t3: (data as any)['kp1T3']
                        },
                        KP2: {
                            tIdle: (data as any)['kp2TIdle'],
                            tTarget: (data as any)['kp2TTarget'],
                            t1: (data as any)['kp2T1'],
                            t2: (data as any)['kp2T2'],
                            t3: (data as any)['kp2T3']
                        },
                        KP3: {
                            tIdle: (data as any)['kp3TIdle'],
                            tTarget: (data as any)['kp3TTarget'],
                            t1: (data as any)['kp3T1'],
                            t2: (data as any)['kp3T2'],
                            t3: (data as any)['kp3T3']
                        },
                        KP4: {
                            tIdle: (data as any)['kp4TIdle'],
                            tTarget: (data as any)['kp4TTarget'],
                            t1: (data as any)['kp4T1'],
                            t2: (data as any)['kp4T2'],
                            t3: (data as any)['kp4T3']
                        },
                        PCF: {
                            tIdle: (data as any)['pcfTIdle'],
                            tTarget: (data as any)['pcfTTarget'],
                            t1: (data as any)['pcfT1'],
                            t2: (data as any)['pcfT2'],
                            t3: (data as any)['pcfT3']
                        },
                        Injector: {
                            tIdle: (data as any)['injectTIdle'],
                            tTarget: (data as any)['injectTTarget'],
                            t1: (data as any)['injectT1'],
                            t2: (data as any)['injectT2'],
                            t3: (data as any)['injectT3']
                        },
                        Column1: {
                            tIdle: (data as any)['c1TIdle'],
                            tTarget: (data as any)['c1TTarget'],
                            t1: (data as any)['c1T1'],
                            t2: (data as any)['c1T2'],
                            t3: (data as any)['c1T3']
                        },
                        Column2: {
                            tIdle: (data as any)['c2TIdle'],
                            tTarget: (data as any)['c2TTarget'],
                            t1: (data as any)['c2T1'],
                            t2: (data as any)['c2T2'],
                            t3: (data as any)['c2T3']
                        },
                        Column3: {
                            tIdle: (data as any)['c3TIdle'],
                            tTarget: (data as any)['c3TTarget'],
                            t1: (data as any)['c3T1'],
                            t2: (data as any)['c3T2'],
                            t3: (data as any)['c3T3']
                        },
                        Save_Data: (data as any)['saveData'],
                        Total_Run_Time: (data as any)['totalRuntime']
                    };
                    break;
                
                case this.configTypes[1]:
                    paramData[strKeyLabel] = {
                        KP1: {
                            tIdle: (data as any)['kpaTIdle'],
                            tTarget: (data as any)['kpaTTarget'],
                            t1: (data as any)['kpaT1'],
                            t2: (data as any)['kpaT2'],
                            t3: (data as any)['kpaT3']
                        },
                        KP3: {
                            tIdle: (data as any)['kpbTIdle'],
                            tTarget: (data as any)['kpbTTarget'],
                            t1: (data as any)['kpbT1'],
                            t2: (data as any)['kpbT2'],
                            t3: (data as any)['kpbT3']
                        },
                        PCF: {
                            tIdle: (data as any)['pcfTIdle'],
                            tTarget: (data as any)['pcfTTarget'],
                            t1: (data as any)['pcfT1'],
                            t2: (data as any)['pcfT2'],
                            t3: (data as any)['pcfT3']
                        },
                        Injector: {
                            tIdle: (data as any)['injectTIdle'],
                            tTarget: (data as any)['injectTTarget'],
                            t1: (data as any)['injectT1'],
                            t2: (data as any)['injectT2'],
                            t3: (data as any)['injectT3']
                        },
                        Column1: {
                            tIdle: (data as any)['c1TIdle'],
                            tTarget: (data as any)['c1TTarget'],
                            t1: (data as any)['c1T1'],
                            t2: (data as any)['c1T2'],
                            t3: (data as any)['c1T3']
                        },
                        Column2: {
                            tIdle: (data as any)['c2TIdle'],
                            tTarget: (data as any)['c2TTarget'],
                            t1: (data as any)['c2T1'],
                            t2: (data as any)['c2T2'],
                            t3: (data as any)['c2T3']
                        },
                        Column3: {
                            tIdle: (data as any)['c3TIdle'],
                            tTarget: (data as any)['c3TTarget'],
                            t1: (data as any)['c3T1'],
                            t2: (data as any)['c3T2'],
                            t3: (data as any)['c3T3']
                        },
                        Save_Data: (data as any)['saveData'],
                        Total_Run_Time: (data as any)['totalRuntime']
                    };
                    break;

                case this.configTypes[2]:
                    paramData[strKeyLabel] = {
                        KP1: {
                            tIdle: (data as any)['kpaTIdle'],
                            tTarget: (data as any)['kpaTTarget'],
                            t1: (data as any)['kpaT1'],
                            t2: (data as any)['kpaT2'],
                            t3: (data as any)['kpaT3']
                        },
                        KP3: {
                            tIdle: (data as any)['kpbTIdle'],
                            tTarget: (data as any)['kpbTTarget'],
                            t1: (data as any)['kpbT1'],
                            t2: (data as any)['kpbT2'],
                            t3: (data as any)['kpbT3']
                        },
                        PCF: {
                            tIdle: (data as any)['pcfTIdle'],
                            tTarget: (data as any)['pcfTTarget'],
                            t1: (data as any)['pcfT1'],
                            t2: (data as any)['pcfT2'],
                            t3: (data as any)['pcfT3']
                        },
                        Injector: {
                            tIdle: (data as any)['injectTIdle'],
                            tTarget: (data as any)['injectTTarget'],
                            t1: (data as any)['injectT1'],
                            t2: (data as any)['injectT2'],
                            t3: (data as any)['injectT3']
                        },
                        Column1: {
                            tIdle: (data as any)['c1TIdle'],
                            tTarget: (data as any)['c1TTarget'],
                            t1: (data as any)['c1T1'],
                            t2: (data as any)['c1T2'],
                            t3: (data as any)['c1T3']
                        },
                        Column2: {
                            tIdle: (data as any)['c2TIdle'],
                            tTarget: (data as any)['c2TTarget'],
                            t1: (data as any)['c2T1'],
                            t2: (data as any)['c2T2'],
                            t3: (data as any)['c2T3']
                        },
                        Column3: {
                            tIdle: (data as any)['c3TIdle'],
                            tTarget: (data as any)['c3TTarget'],
                            t1: (data as any)['c3T1'],
                            t2: (data as any)['c3T2'],
                            t3: (data as any)['c3T3']
                        },
                        Save_Data: (data as any)['saveData'],
                        Total_Run_Time: (data as any)['totalRuntime']
                    };
                    break;
            }
        }

        submitData['Mode_Config'] = paramData;
        let configData = <any>{};
        configData[this.currentType] = submitData;
        configData['Current_Type'] = this.currentType;

        this.dialog.close(configData);
    }

    initData() {
        this.asIData = {
            KP1: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            KP2: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            KP3: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            KP4: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            PCF: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Injector: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Column1: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Column2: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Column3: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Save_Data: false,
            Total_Run_Time: 0
            
        };

        this.dtIData = {
            KP1: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            KP3: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            PCF: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Injector: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Column1: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Column2: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Column3: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Save_Data: false,
            Total_Run_Time: 0
        };

        this.fdIData = {
            KP1: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            KP3: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            PCF: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Injector: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Column1: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Column2: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Column3: {
                tIdle: 1, tTarget: 1, t1: 1, t2: 1, t3: 1
            },
            Save_Data: false,
            Total_Run_Time: 0
        };
    }

    setFormParamFromApi(params: Object) {
        switch (this.currentType) {
            case this.configTypes[0]:
                this.absoluteForm.controls['kp1TIdle'].setValue(params['KP1']['tIdle']);
                this.absoluteForm.controls['kp1TTarget'].setValue(params['KP1']['tTarget']);
                this.absoluteForm.controls['kp1T1'].setValue(params['KP1']['t1']);
                this.absoluteForm.controls['kp1T2'].setValue(params['KP1']['t2']);
                this.absoluteForm.controls['kp1T3'].setValue(params['KP1']['t3']);

                this.absoluteForm.controls['kp2TIdle'].setValue(params['KP2']['tIdle']);
                this.absoluteForm.controls['kp2TTarget'].setValue(params['KP2']['tTarget']);
                this.absoluteForm.controls['kp2T1'].setValue(params['KP2']['t1']);
                this.absoluteForm.controls['kp2T2'].setValue(params['KP2']['t2']);
                this.absoluteForm.controls['kp2T3'].setValue(params['KP2']['t3']);

                this.absoluteForm.controls['kp3TIdle'].setValue(params['KP3']['tIdle']);
                this.absoluteForm.controls['kp3TTarget'].setValue(params['KP3']['tTarget']);
                this.absoluteForm.controls['kp3T1'].setValue(params['KP3']['t1']);
                this.absoluteForm.controls['kp3T2'].setValue(params['KP3']['t2']);
                this.absoluteForm.controls['kp3T3'].setValue(params['KP3']['t3']);

                this.absoluteForm.controls['kp4TIdle'].setValue(params['KP4']['tIdle']);
                this.absoluteForm.controls['kp4TTarget'].setValue(params['KP4']['tTarget']);
                this.absoluteForm.controls['kp4T1'].setValue(params['KP4']['t1']);
                this.absoluteForm.controls['kp4T2'].setValue(params['KP4']['t2']);
                this.absoluteForm.controls['kp4T3'].setValue(params['KP4']['t3']);

                this.absoluteForm.controls['pcfTIdle'].setValue(params['PCF']['tIdle']);
                this.absoluteForm.controls['pcfTTarget'].setValue(params['PCF']['tTarget']);
                this.absoluteForm.controls['pcfT1'].setValue(params['PCF']['t1']);
                this.absoluteForm.controls['pcfT2'].setValue(params['PCF']['t2']);
                this.absoluteForm.controls['pcfT3'].setValue(params['PCF']['t3']);

                this.absoluteForm.controls['injectTIdle'].setValue(params['Injector']['tIdle']);
                this.absoluteForm.controls['injectTTarget'].setValue(params['Injector']['tTarget']);
                this.absoluteForm.controls['injectT1'].setValue(params['Injector']['t1']);
                this.absoluteForm.controls['injectT2'].setValue(params['Injector']['t2']);
                this.absoluteForm.controls['injectT3'].setValue(params['Injector']['t3']);

                this.absoluteForm.controls['c1TIdle'].setValue(params['Column1']['tIdle']);
                this.absoluteForm.controls['c1TTarget'].setValue(params['Column1']['tTarget']);
                this.absoluteForm.controls['c1T1'].setValue(params['Column1']['t1']);
                this.absoluteForm.controls['c1T2'].setValue(params['Column1']['t2']);
                this.absoluteForm.controls['c1T3'].setValue(params['Column1']['t3']);

                this.absoluteForm.controls['c2TIdle'].setValue(params['Column2']['tIdle']);
                this.absoluteForm.controls['c2TTarget'].setValue(params['Column2']['tTarget']);
                this.absoluteForm.controls['c2T1'].setValue(params['Column2']['t1']);
                this.absoluteForm.controls['c2T2'].setValue(params['Column2']['t2']);
                this.absoluteForm.controls['c2T3'].setValue(params['Column2']['t3']);

                this.absoluteForm.controls['c3TIdle'].setValue(params['Column3']['tIdle']);
                this.absoluteForm.controls['c3TTarget'].setValue(params['Column3']['tTarget']);
                this.absoluteForm.controls['c3T1'].setValue(params['Column3']['t1']);
                this.absoluteForm.controls['c3T2'].setValue(params['Column3']['t2']);
                this.absoluteForm.controls['c3T3'].setValue(params['Column3']['t3']);
                this.absoluteForm.controls['saveData'].setValue(params['Save_Data']);
                this.absoluteForm.controls['totalRuntime'].setValue(params['Total_Run_Time']);
                break;

            case this.configTypes[1]:

                this.deltaForm.controls['kpaTIdle'].setValue(params['KP1']['tIdle']);
                this.deltaForm.controls['kpaTTarget'].setValue(params['KP1']['tTarget']);
                this.deltaForm.controls['kpaT1'].setValue(params['KP1']['t1']);
                this.deltaForm.controls['kpaT2'].setValue(params['KP1']['t2']);
                this.deltaForm.controls['kpaT3'].setValue(params['KP1']['t3']);

                this.deltaForm.controls['kpbTIdle'].setValue(params['KP3']['tIdle']);
                this.deltaForm.controls['kpbTTarget'].setValue(params['KP3']['tTarget']);
                this.deltaForm.controls['kpbT1'].setValue(params['KP3']['t1']);
                this.deltaForm.controls['kpbT2'].setValue(params['KP3']['t2']);
                this.deltaForm.controls['kpbT3'].setValue(params['KP3']['t3']);

                this.deltaForm.controls['pcfTIdle'].setValue(params['PCF']['tIdle']);
                this.deltaForm.controls['pcfTTarget'].setValue(params['PCF']['tTarget']);
                this.deltaForm.controls['pcfT1'].setValue(params['PCF']['t1']);
                this.deltaForm.controls['pcfT2'].setValue(params['PCF']['t2']);
                this.deltaForm.controls['pcfT3'].setValue(params['PCF']['t3']);

                this.deltaForm.controls['injectTIdle'].setValue(params['Injector']['tIdle']);
                this.deltaForm.controls['injectTTarget'].setValue(params['Injector']['tTarget']);
                this.deltaForm.controls['injectT1'].setValue(params['Injector']['t1']);
                this.deltaForm.controls['injectT2'].setValue(params['Injector']['t2']);
                this.deltaForm.controls['injectT3'].setValue(params['Injector']['t3']);

                this.deltaForm.controls['c1TIdle'].setValue(params['Column1']['tIdle']);
                this.deltaForm.controls['c1TTarget'].setValue(params['Column1']['tTarget']);
                this.deltaForm.controls['c1T1'].setValue(params['Column1']['t1']);
                this.deltaForm.controls['c1T2'].setValue(params['Column1']['t2']);
                this.deltaForm.controls['c1T3'].setValue(params['Column1']['t3']);

                this.deltaForm.controls['c2TIdle'].setValue(params['Column2']['tIdle']);
                this.deltaForm.controls['c2TTarget'].setValue(params['Column2']['tTarget']);
                this.deltaForm.controls['c2T1'].setValue(params['Column2']['t1']);
                this.deltaForm.controls['c2T2'].setValue(params['Column2']['t2']);
                this.deltaForm.controls['c2T3'].setValue(params['Column2']['t3']);

                this.deltaForm.controls['c3TIdle'].setValue(params['Column3']['tIdle']);
                this.deltaForm.controls['c3TTarget'].setValue(params['Column3']['tTarget']);
                this.deltaForm.controls['c3T1'].setValue(params['Column3']['t1']);
                this.deltaForm.controls['c3T2'].setValue(params['Column3']['t2']);
                this.deltaForm.controls['c3T3'].setValue(params['Column3']['t3']);

                this.deltaForm.controls['saveData'].setValue(params['Save_Data']);
                this.deltaForm.controls['totalRuntime'].setValue(params['Total_Run_Time']);
                break;

            case this.configTypes[2]:
                this.fracDeltaForm.controls['kpaTIdle'].setValue(params['KP1']['tIdle']);
                this.fracDeltaForm.controls['kpaTTarget'].setValue(params['KP1']['tTarget']);
                this.fracDeltaForm.controls['kpaT1'].setValue(params['KP1']['t1']);
                this.fracDeltaForm.controls['kpaT2'].setValue(params['KP1']['t2']);
                this.fracDeltaForm.controls['kpaT3'].setValue(params['KP1']['t3']);

                this.fracDeltaForm.controls['kpbTIdle'].setValue(params['KP3']['tIdle']);
                this.fracDeltaForm.controls['kpbTTarget'].setValue(params['KP3']['tTarget']);
                this.fracDeltaForm.controls['kpbT1'].setValue(params['KP3']['t1']);
                this.fracDeltaForm.controls['kpbT2'].setValue(params['KP3']['t2']);
                this.fracDeltaForm.controls['kpbT3'].setValue(params['KP3']['t3']);

                this.fracDeltaForm.controls['pcfTIdle'].setValue(params['PCF']['tIdle']);
                this.fracDeltaForm.controls['pcfTTarget'].setValue(params['PCF']['tTarget']);
                this.fracDeltaForm.controls['pcfT1'].setValue(params['PCF']['t1']);
                this.fracDeltaForm.controls['pcfT2'].setValue(params['PCF']['t2']);
                this.fracDeltaForm.controls['pcfT3'].setValue(params['PCF']['t3']);

                this.fracDeltaForm.controls['injectTIdle'].setValue(params['Injector']['tIdle']);
                this.fracDeltaForm.controls['injectTTarget'].setValue(params['Injector']['tTarget']);
                this.fracDeltaForm.controls['injectT1'].setValue(params['Injector']['t1']);
                this.fracDeltaForm.controls['injectT2'].setValue(params['Injector']['t2']);
                this.fracDeltaForm.controls['injectT3'].setValue(params['Injector']['t3']);

                this.fracDeltaForm.controls['c1TIdle'].setValue(params['Column1']['tIdle']);
                this.fracDeltaForm.controls['c1TTarget'].setValue(params['Column1']['tTarget']);
                this.fracDeltaForm.controls['c1T1'].setValue(params['Column1']['t1']);
                this.fracDeltaForm.controls['c1T2'].setValue(params['Column1']['t2']);
                this.fracDeltaForm.controls['c1T3'].setValue(params['Column1']['t3']);

                this.fracDeltaForm.controls['c2TIdle'].setValue(params['Column2']['tIdle']);
                this.fracDeltaForm.controls['c2TTarget'].setValue(params['Column2']['tTarget']);
                this.fracDeltaForm.controls['c2T1'].setValue(params['Column2']['t1']);
                this.fracDeltaForm.controls['c2T2'].setValue(params['Column2']['t2']);
                this.fracDeltaForm.controls['c2T3'].setValue(params['Column2']['t3']);

                this.fracDeltaForm.controls['c3TIdle'].setValue(params['Column3']['tIdle']);
                this.fracDeltaForm.controls['c3TTarget'].setValue(params['Column3']['tTarget']);
                this.fracDeltaForm.controls['c3T1'].setValue(params['Column3']['t1']);
                this.fracDeltaForm.controls['c3T2'].setValue(params['Column3']['t2']);
                this.fracDeltaForm.controls['c3T3'].setValue(params['Column3']['t3']);

                this.fracDeltaForm.controls['saveData'].setValue(params['Save_Data']);
                this.fracDeltaForm.controls['totalRuntime'].setValue(params['Total_Run_Time']);
                break;
        }
    }

    setFormParam(params: Object) {
        switch (this.currentType) {
            case this.configTypes[0]:
                for (let key in params) {
                    this.absoluteForm.controls[key].setValue(params[key]);
                }
                break;

            case this.configTypes[1]:
                for (let key in params) {
                    this.deltaForm.controls[key].setValue(params[key]);
                }
                break;

            case this.configTypes[2]:
                for (let key in params) {
                    this.fracDeltaForm.controls[key].setValue(params[key]);
                }
                break;
        }
    }

	ngOnInit() {
        this.nCurrentStep = 1;
        this.initData();

        this.numberForm = new FormGroup({
            stepNumber: new FormControl(1, [
                <any>Validators.required
            ]),
            runNumber: new FormControl(1, [
                <any>Validators.required
            ])
        });

		this.absoluteForm = new FormGroup({
        	kp1TIdle: new FormControl(this.asIData['KP1']['tIdle'], [
        		<any>Validators.required
        	]),
        	kp1TTarget: new FormControl(this.asIData['KP1']['tTarget'], [
        		<any>Validators.required
        	]),
        	kp1T1: new FormControl(this.asIData['KP1']['t1'], [
        		<any>Validators.required
        	]),
        	kp1T2: new FormControl(this.asIData['KP1']['t2'], [
        		<any>Validators.required
        	]),
        	kp1T3: new FormControl(this.asIData['KP1']['t3'], [
        		<any>Validators.required
        	]),
        	kp2TIdle: new FormControl(this.asIData['KP2']['tIdle'], [
        		<any>Validators.required
        	]),
        	kp2TTarget: new FormControl(this.asIData['KP2']['tTarget'], [
        		<any>Validators.required
        	]),
        	kp2T1: new FormControl(this.asIData['KP2']['t1'], [
        		<any>Validators.required
        	]),
        	kp2T2: new FormControl(this.asIData['KP2']['t2'], [
        		<any>Validators.required
        	]),
        	kp2T3: new FormControl(this.asIData['KP2']['t3'], [
        		<any>Validators.required
        	]),
        	kp3TIdle: new FormControl(this.asIData['KP3']['tIdle'], [
        		<any>Validators.required
        	]),
        	kp3TTarget: new FormControl(this.asIData['KP3']['tTarget'], [
        		<any>Validators.required
        	]),
        	kp3T1: new FormControl(this.asIData['KP3']['t1'], [
        		<any>Validators.required
        	]),
        	kp3T2: new FormControl(this.asIData['KP3']['t2'], [
        		<any>Validators.required
        	]),
        	kp3T3: new FormControl(this.asIData['KP3']['t3'], [
        		<any>Validators.required
        	]),
        	kp4TIdle: new FormControl(this.asIData['KP4']['tIdle'], [
        		<any>Validators.required
        	]),
        	kp4TTarget: new FormControl(this.asIData['KP4']['tTarget'], [
        		<any>Validators.required
        	]),
        	kp4T1: new FormControl(this.asIData['KP4']['t1'], [
        		<any>Validators.required
        	]),
        	kp4T2: new FormControl(this.asIData['KP4']['t2'], [
        		<any>Validators.required
        	]),
        	kp4T3: new FormControl(this.asIData['KP4']['t3'], [
        		<any>Validators.required
        	]),
        	pcfTIdle: new FormControl(this.asIData['PCF']['tIdle'], [
        		<any>Validators.required
        	]),
        	pcfTTarget: new FormControl(this.asIData['PCF']['tTarget'], [
        		<any>Validators.required
        	]),
        	pcfT1: new FormControl(this.asIData['PCF']['t1'], [
        		<any>Validators.required
        	]),
        	pcfT2: new FormControl(this.asIData['PCF']['t2'], [
        		<any>Validators.required
        	]),
        	pcfT3: new FormControl(this.asIData['PCF']['t3'], [
        		<any>Validators.required
        	]),
        	injectTIdle: new FormControl(this.asIData['Injector']['tIdle'], [
        		<any>Validators.required
        	]),
        	injectTTarget: new FormControl(this.asIData['Injector']['tTarget'], [
        		<any>Validators.required
        	]),
        	injectT1: new FormControl(this.asIData['Injector']['t1'], [
        		<any>Validators.required
        	]),
        	injectT2: new FormControl(this.asIData['Injector']['t2'], [
        		<any>Validators.required
        	]),
        	injectT3: new FormControl(this.asIData['Injector']['t3'], [
        		<any>Validators.required
        	]),
        	c1TIdle: new FormControl(this.asIData['Column1']['tIdle'], [
        		<any>Validators.required
        	]),
        	c1TTarget: new FormControl(this.asIData['Column1']['tTarget'], [
        		<any>Validators.required
        	]),
        	c1T1: new FormControl(this.asIData['Column1']['t1'], [
        		<any>Validators.required
        	]),
        	c1T2: new FormControl(this.asIData['Column1']['t2'], [
        		<any>Validators.required
        	]),
        	c1T3: new FormControl(this.asIData['Column1']['t3'], [
        		<any>Validators.required
        	]),
        	c2TIdle: new FormControl(this.asIData['Column2']['tIdle'], [
        		<any>Validators.required
        	]),
        	c2TTarget: new FormControl(this.asIData['Column2']['tTarget'], [
        		<any>Validators.required
        	]),
        	c2T1: new FormControl(this.asIData['Column2']['t1'], [
        		<any>Validators.required
        	]),
        	c2T2: new FormControl(this.asIData['Column2']['t2'], [
        		<any>Validators.required
        	]),
        	c2T3: new FormControl(this.asIData['Column2']['t3'], [
        		<any>Validators.required
        	]),
        	c3TIdle: new FormControl(this.asIData['Column3']['tIdle'], [
        		<any>Validators.required
        	]),
        	c3TTarget: new FormControl(this.asIData['Column3']['tTarget'], [
        		<any>Validators.required
        	]),
        	c3T1: new FormControl(this.asIData['Column3']['t1'], [
        		<any>Validators.required
        	]),
        	c3T2: new FormControl(this.asIData['Column3']['t2'], [
        		<any>Validators.required
        	]),
        	c3T3: new FormControl(this.asIData['Column3']['t3'], [
        		<any>Validators.required
        	]),
            saveData: new FormControl(this.asIData['Save_Data'], [
                    <any>Validators.required
            ]),
            totalRuntime: new FormControl(this.asIData['Total_Run_Time'], [
                    <any>Validators.required
            ])
	    });

		this.deltaForm = new FormGroup({
	        kpaTIdle: new FormControl(this.dtIData['KP1']['tIdle'], [
        		<any>Validators.required
        	]),
        	kpaTTarget: new FormControl(this.dtIData['KP1']['tTarget'], [
        		<any>Validators.required
        	]),
        	kpaT1: new FormControl(this.dtIData['KP1']['t1'], [
        		<any>Validators.required
        	]),
        	kpaT2: new FormControl(this.dtIData['KP1']['t2'], [
        		<any>Validators.required
        	]),
        	kpaT3: new FormControl(this.dtIData['KP1']['t3'], [
        		<any>Validators.required
        	]),
        	kpbTIdle: new FormControl(this.dtIData['KP3']['tIdle'], [
        		<any>Validators.required
        	]),
        	kpbTTarget: new FormControl(this.dtIData['KP3']['tTarget'], [
        		<any>Validators.required
        	]),
        	kpbT1: new FormControl(this.dtIData['KP3']['t1'], [
        		<any>Validators.required
        	]),
        	kpbT2: new FormControl(this.dtIData['KP3']['t2'], [
        		<any>Validators.required
        	]),
        	kpbT3: new FormControl(this.dtIData['KP3']['t3'], [
        		<any>Validators.required
        	]),
        	pcfTIdle: new FormControl(this.dtIData['PCF']['tIdle'], [
        		<any>Validators.required
        	]),
        	pcfTTarget: new FormControl(this.dtIData['PCF']['tTarget'], [
        		<any>Validators.required
        	]),
        	pcfT1: new FormControl(this.dtIData['PCF']['t1'], [
        		<any>Validators.required
        	]),
        	pcfT2: new FormControl(this.dtIData['PCF']['t2'], [
        		<any>Validators.required
        	]),
        	pcfT3: new FormControl(this.dtIData['PCF']['t3'], [
        		<any>Validators.required
        	]),
        	injectTIdle: new FormControl(this.dtIData['Injector']['tIdle'], [
        		<any>Validators.required
        	]),
        	injectTTarget: new FormControl(this.dtIData['Injector']['tTarget'], [
        		<any>Validators.required
        	]),
        	injectT1: new FormControl(this.dtIData['Injector']['t1'], [
        		<any>Validators.required
        	]),
        	injectT2: new FormControl(this.dtIData['Injector']['t2'], [
        		<any>Validators.required
        	]),
        	injectT3: new FormControl(this.dtIData['Injector']['t3'], [
        		<any>Validators.required
        	]),
        	c1TIdle: new FormControl(this.dtIData['Column1']['tIdle'], [
        		<any>Validators.required
        	]),
        	c1TTarget: new FormControl(this.dtIData['Column1']['tTarget'], [
        		<any>Validators.required
        	]),
        	c1T1: new FormControl(this.dtIData['Column1']['t1'], [
        		<any>Validators.required
        	]),
        	c1T2: new FormControl(this.dtIData['Column1']['t2'], [
        		<any>Validators.required
        	]),
        	c1T3: new FormControl(this.dtIData['Column1']['t3'], [
        		<any>Validators.required
        	]),
        	c2TIdle: new FormControl(this.dtIData['Column2']['tIdle'], [
        		<any>Validators.required
        	]),
        	c2TTarget: new FormControl(this.dtIData['Column2']['tTarget'], [
        		<any>Validators.required
        	]),
        	c2T1: new FormControl(this.dtIData['Column2']['t1'], [
        		<any>Validators.required
        	]),
        	c2T2: new FormControl(this.dtIData['Column2']['t2'], [
        		<any>Validators.required
        	]),
        	c2T3: new FormControl(this.dtIData['Column2']['t3'], [
        		<any>Validators.required
        	]),
        	c3TIdle: new FormControl(this.dtIData['Column3']['tIdle'], [
        		<any>Validators.required
        	]),
        	c3TTarget: new FormControl(this.dtIData['Column3']['tTarget'], [
        		<any>Validators.required
        	]),
        	c3T1: new FormControl(this.dtIData['Column3']['t1'], [
        		<any>Validators.required
        	]),
        	c3T2: new FormControl(this.dtIData['Column3']['t2'], [
        		<any>Validators.required
        	]),
        	c3T3: new FormControl(this.dtIData['Column3']['t3'], [
        		<any>Validators.required
        	]),
            saveData: new FormControl(this.dtIData['Save_Data'], [
                    <any>Validators.required
            ]),
            totalRuntime: new FormControl(this.dtIData['Total_Run_Time'], [
                    <any>Validators.required
            ])
	    });

	    this.fracDeltaForm = new FormGroup({
	        kpaTIdle: new FormControl(this.fdIData['KP1']['tIdle'], [
                <any>Validators.required
            ]),
            kpaTTarget: new FormControl(this.fdIData['KP1']['tTarget'], [
                <any>Validators.required
            ]),
            kpaT1: new FormControl(this.fdIData['KP1']['t1'], [
                <any>Validators.required
            ]),
            kpaT2: new FormControl(this.fdIData['KP1']['t2'], [
                <any>Validators.required
            ]),
            kpaT3: new FormControl(this.fdIData['KP1']['t3'], [
                <any>Validators.required
            ]),
            kpbTIdle: new FormControl(this.fdIData['KP3']['tIdle'], [
                <any>Validators.required
            ]),
            kpbTTarget: new FormControl(this.fdIData['KP3']['tTarget'], [
                <any>Validators.required
            ]),
            kpbT1: new FormControl(this.fdIData['KP3']['t1'], [
                <any>Validators.required
            ]),
            kpbT2: new FormControl(this.fdIData['KP3']['t2'], [
                <any>Validators.required
            ]),
            kpbT3: new FormControl(this.fdIData['KP3']['t3'], [
                <any>Validators.required
            ]),
            pcfTIdle: new FormControl(this.fdIData['PCF']['tIdle'], [
                <any>Validators.required
            ]),
            pcfTTarget: new FormControl(this.fdIData['PCF']['tTarget'], [
                <any>Validators.required
            ]),
            pcfT1: new FormControl(this.fdIData['PCF']['t1'], [
                <any>Validators.required
            ]),
            pcfT2: new FormControl(this.fdIData['PCF']['t2'], [
                <any>Validators.required
            ]),
            pcfT3: new FormControl(this.fdIData['PCF']['t3'], [
                <any>Validators.required
            ]),
            injectTIdle: new FormControl(this.fdIData['Injector']['tIdle'], [
                <any>Validators.required
            ]),
            injectTTarget: new FormControl(this.fdIData['Injector']['tTarget'], [
                <any>Validators.required
            ]),
            injectT1: new FormControl(this.fdIData['Injector']['t1'], [
                <any>Validators.required
            ]),
            injectT2: new FormControl(this.fdIData['Injector']['t2'], [
                <any>Validators.required
            ]),
            injectT3: new FormControl(this.fdIData['Injector']['t3'], [
                <any>Validators.required
            ]),
            c1TIdle: new FormControl(this.fdIData['Column1']['tIdle'], [
                <any>Validators.required
            ]),
            c1TTarget: new FormControl(this.fdIData['Column1']['tTarget'], [
                <any>Validators.required
            ]),
            c1T1: new FormControl(this.fdIData['Column1']['t1'], [
                <any>Validators.required
            ]),
            c1T2: new FormControl(this.fdIData['Column1']['t2'], [
                <any>Validators.required
            ]),
            c1T3: new FormControl(this.fdIData['Column1']['t3'], [
                <any>Validators.required
            ]),
            c2TIdle: new FormControl(this.fdIData['Column2']['tIdle'], [
                <any>Validators.required
            ]),
            c2TTarget: new FormControl(this.fdIData['Column2']['tTarget'], [
                <any>Validators.required
            ]),
            c2T1: new FormControl(this.fdIData['Column2']['t1'], [
                <any>Validators.required
            ]),
            c2T2: new FormControl(this.fdIData['Column2']['t2'], [
                <any>Validators.required
            ]),
            c2T3: new FormControl(this.fdIData['Column2']['t3'], [
                <any>Validators.required
            ]),
            c3TIdle: new FormControl(this.fdIData['Column3']['tIdle'], [
                <any>Validators.required
            ]),
            c3TTarget: new FormControl(this.fdIData['Column3']['tTarget'], [
                <any>Validators.required
            ]),
            c3T1: new FormControl(this.fdIData['Column3']['t1'], [
                <any>Validators.required
            ]),
            c3T2: new FormControl(this.fdIData['Column3']['t2'], [
                <any>Validators.required
            ]),
            c3T3: new FormControl(this.fdIData['Column3']['t3'], [
                <any>Validators.required
            ]),
            saveData: new FormControl(this.fdIData['Save_Data'], [
                    <any>Validators.required
            ]),
            totalRuntime: new FormControl(this.fdIData['Total_Run_Time'], [
                    <any>Validators.required
            ])
	    });
	}

	close() {
		this.dialog.close();
	}

}
