import { Component } from '@angular/core';

@Component({
  selector: 'app-offer-slideshow',
  imports: [],
  templateUrl: './offer-slideshow.component.html',
  styleUrl: './offer-slideshow.component.css'
})
export class OfferSlideshowComponent {
  offers = [
    { title: "Special Offer!", details: "Get 50% off on all products. Limited time only!" },
    { title: "New Arrivals!", details: "Check out our latest collection now." },
    { title: "Exclusive Discount!", details: "Sign up today and get an extra 20% off." }
  ];
  currentOffer = 0;

  constructor() {
    setInterval(() => {
      this.currentOffer = (this.currentOffer + 1) % this.offers.length;
    }, 5000);
  }
}
