import { Component } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  toggleChatbot() {
    const chatbot = document.querySelector('app-chatbot') as HTMLElement;
    if (chatbot) {
      chatbot.classList.toggle('visible');
    }
  }
}
