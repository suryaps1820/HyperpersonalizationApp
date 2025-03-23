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
    this.messages.push({ text: this.userInput, type: 'user-message' });
    const userMessage = this.userInput.trim();
    this.userInput = '';
    setTimeout(() => {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    });
    this.fetchBotResponse(userMessage);
  }

  fetchBotResponse(userMessage: string) {
    const prompt = `You are a banking and finance chatbot. Only provide answers within this scope. Question: ${userMessage}`;
    
    const chatMessage = { text: '', type: 'chatbot-message' };
    this.messages.push(chatMessage); // Add empty message placeholder
  
    fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'mistral', prompt: prompt, stream: true })
    })
    .then(response => {
      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      const processStream :any = ({ done, value }: ReadableStreamReadResult<Uint8Array>) => {
        if (done) return;
        const chunk = decoder.decode(value, { stream: true });
        chatMessage.text += chunk; // Append chunked text to message
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
        return reader.read().then(processStream);
      };
  
      return reader.read().then(processStream);
    })
    .catch(error => {
      console.error('Streaming Error:', error);
      chatMessage.text = 'Error: Unable to connect to AI.';
    });
  }
}
