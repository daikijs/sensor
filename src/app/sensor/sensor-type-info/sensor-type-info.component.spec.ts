import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorTypeInfoComponent } from './sensor-type-info.component';

describe('SensorTypeInfoComponent', () => {
  let component: SensorTypeInfoComponent;
  let fixture: ComponentFixture<SensorTypeInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorTypeInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorTypeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
