import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule]
})
export class ChatbotComponent {
  @ViewChild('chatBody', { static: false }) chatBody!: ElementRef;
  userInput: string = '';
  chatVisible: boolean = false;
  messages: { text: string; type: string }[] = [];

  constructor(private http: HttpClient) {}

  toggleChat() {
    this.chatVisible = !this.chatVisible;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;
    
    // Add user message to chat
    this.messages.push({ text: this.userInput, type: 'user-message' });

    const userMessage = this.userInput.trim();
    this.userInput = ''; // Clear input field

    // Auto-scroll to the latest message
    setTimeout(() => {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    });

    // Fetch bot response
    this.fetchBotResponse(userMessage);
  }

  fetchBotResponse(userMessage: string) {
    const prompt = `You are a banking and finance chatbot. Only provide answers within this scope. Question: ${userMessage}`;

    this.http.post('http://localhost:3000/api/generate', {
      model: 'mistral',
      prompt: prompt,
      stream: true
    }, { responseType: 'text' }).subscribe(
      response => this.messages.push({ text: response, type: 'chatbot-message' }),
      error => {
        this.messages.push({ text: 'Error: Unable to connect to AI.', type: 'chatbot-message' });
        console.error('Chatbot Error:', error);
      }
    );
  }
}
