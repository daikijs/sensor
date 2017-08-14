import { TestBed, inject } from '@angular/core/testing';
import { ConfirmModalService } from './confirm-modal.service';

describe('ConfirmModalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmModalService]
    });
  });

  it('should ...', inject([ConfirmModalService], (service: ConfirmModalService) => {
    expect(service).toBeTruthy();
  }));
});
