import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploadCardComponent } from './image-upload-card.component';

describe('ImageUploadCardComponent', () => {
  let component: ImageUploadCardComponent;
  let fixture: ComponentFixture<ImageUploadCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageUploadCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
