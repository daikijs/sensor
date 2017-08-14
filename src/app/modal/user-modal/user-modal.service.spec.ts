import { TestBed, inject } from '@angular/core/testing';
import { UserModalService } from './user-modal.service';

describe('UserModalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserModalService]
    });
  });

  it('should ...', inject([UserModalService], (service: UserModalService) => {
    expect(service).toBeTruthy();
  }));
});
