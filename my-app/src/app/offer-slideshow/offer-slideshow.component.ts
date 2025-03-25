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
    console.log(`Fetching offers for Customer ID: ${customerId}`);
  
    this.customerService.getOffers(customerId).subscribe((offers: OfferList[]) => {
      if (offers && offers.length > 0) {
        this.offers = offers.map(x => ({
          title: x.title,
          details: x.details
        }));
        console.log("Offers successfully loaded", this.offers);
      } else {
        console.log("No offers available for this customer.");
      }
    });
  }
  

}

interface OfferList{
  title: String,
  details: String
}