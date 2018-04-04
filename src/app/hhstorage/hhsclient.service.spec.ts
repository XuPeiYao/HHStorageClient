import { TestBed, inject } from '@angular/core/testing';

import { HHSClientService } from './hhsclient.service';

describe('HhsclientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [HHSClientService] });
  });

  it(
    'should be created',
    inject([HHSClientService], (service: HHSClientService) => {
      expect(service).toBeTruthy();
    })
  );
});
