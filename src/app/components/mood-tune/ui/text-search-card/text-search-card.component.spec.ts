import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextSearchCardComponent } from './text-search-card.component';

describe('TextSearchCardComponent', () => {
  let component: TextSearchCardComponent;
  let fixture: ComponentFixture<TextSearchCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextSearchCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextSearchCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
