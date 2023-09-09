import { TestBed } from '@angular/core/testing';

import { StorylistService } from './storylist.service';

describe('StorylistService', () => {
  let service: StorylistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorylistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
