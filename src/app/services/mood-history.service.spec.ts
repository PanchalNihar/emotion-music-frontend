import { TestBed } from '@angular/core/testing';

import { MoodHistoryService } from './mood-history.service';

describe('MoodHistoryService', () => {
  let service: MoodHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoodHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
