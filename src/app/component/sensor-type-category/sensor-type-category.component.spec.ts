import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorTypeCategoryComponent } from './sensor-type-category.component';

describe('SensorTypeCategoryComponent', () => {
  let component: SensorTypeCategoryComponent;
  let fixture: ComponentFixture<SensorTypeCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorTypeCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorTypeCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
