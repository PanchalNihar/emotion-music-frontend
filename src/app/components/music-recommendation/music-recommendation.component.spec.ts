import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicRecommendationComponent } from './music-recommendation.component';

describe('MusicRecommendationComponent', () => {
  let component: MusicRecommendationComponent;
  let fixture: ComponentFixture<MusicRecommendationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicRecommendationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
