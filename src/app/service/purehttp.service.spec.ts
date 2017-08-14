import { TestBed, inject } from '@angular/core/testing';

import { PurehttpService } from './purehttp.service';

describe('PurehttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PurehttpService]
    });
  });

  it('should be created', inject([PurehttpService], (service: PurehttpService) => {
    expect(service).toBeTruthy();
  }));
});
