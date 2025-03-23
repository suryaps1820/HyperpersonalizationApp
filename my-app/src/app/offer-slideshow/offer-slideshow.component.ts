import { Component } from '@angular/core';
import { CustomerDataService } from '../Service/customer-data.service';

@Component({
  selector: 'app-offer-slideshow',
  imports: [],
  templateUrl: './offer-slideshow.component.html',
  styleUrl: './offer-slideshow.component.css'
})
export class OfferSlideshowComponent {

  offers :OfferList[] =[];
  currentOffer = 0;

  constructor(private customerService: CustomerDataService) {
    setInterval(() => {
      this.currentOffer = (this.currentOffer + 1) % this.offers.length;
    }, 5000);
  }
  ngOnInit() {
    this.customerService.customerId$.subscribe(customerId => {
      if (customerId) {
        this.fetchOffers(customerId);
      }
    });
  }

  fetchOffers(customerId: string) {
    // Simulating an API call (Replace with actual HTTP call)
    console.log(`Fetching offers for Customer ID: ${customerId}`);
    this.offers = [
      { title: "Special Offer!", details: "Get 50% off on all products. Limited time only!" },
      { title: "New Arrivals!", details: "Check out our latest collection now." },
      { title: "Exclusive Discount!", details: "Sign up today and get an extra 20% off." }
    ];
  }
}

interface OfferList{
  title: String,
  details: String
}