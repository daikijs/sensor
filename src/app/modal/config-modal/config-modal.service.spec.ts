import { TestBed, inject } from '@angular/core/testing';
import { ConfigModalService } from './config-modal.service';

describe('ConfigModalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigModalService]
    });
  });

  it('should ...', inject([ConfigModalService], (service: ConfigModalService) => {
    expect(service).toBeTruthy();
  }));
});
