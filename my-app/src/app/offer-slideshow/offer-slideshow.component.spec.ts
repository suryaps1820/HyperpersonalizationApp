import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferSlideshowComponent } from './offer-slideshow.component';

describe('OfferSlideshowComponent', () => {
  let component: OfferSlideshowComponent;
  let fixture: ComponentFixture<OfferSlideshowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferSlideshowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferSlideshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
