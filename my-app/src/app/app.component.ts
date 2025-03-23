import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { OfferSlideshowComponent } from './offer-slideshow/offer-slideshow.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { TransactionsComponent } from './transactions/transactions.component';

@Component({
  selector: 'app-root',
  imports: [NavBarComponent,OfferSlideshowComponent,ChatbotComponent,TransactionsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'my-app';
}
