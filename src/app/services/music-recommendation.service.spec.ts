import { TestBed } from '@angular/core/testing';

import { MusicRecommendationService } from './music-recommendation.service';

describe('MusicRecommendationService', () => {
  let service: MusicRecommendationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicRecommendationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
