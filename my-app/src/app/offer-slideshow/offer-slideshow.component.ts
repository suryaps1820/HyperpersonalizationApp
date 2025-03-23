import { Component } from '@angular/core';
import { CustomerDataService } from '../Service/customer-data.service';
import { tick } from '@angular/core/testing';
import { of } from 'rxjs';

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
    this.offers = [];
    this.customerService.getOffers(customerId).subscribe((offers: OfferList[]) => {
      for (let x of offers) { 
        let offer: OfferList = { 
          title: x.title,
          details: x.details
        };
        console.log("fetched offer from backend : " + offer.title + offer.details);
        this.offers.push(offer)
      }
    });    
    
  }
}

interface OfferList{
  title: String,
  details: String
}