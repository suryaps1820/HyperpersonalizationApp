import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerDataService {

  constructor(private http: HttpClient) {}
  private customerIdSource = new BehaviorSubject<string>('123');
  customerId$ = this.customerIdSource.asObservable();
  private apiUrl = 'http://localhost:3000/api'; 
  setCustomerId(id: string) {
    this.customerIdSource.next(id);
  }
  
  getTransactions(customerId: string) :any{
    return this.http.get(`${this.apiUrl}/transactions/${customerId}`);
  }

  getOffers(customerId: string) :any{
    return this.http.get(`${this.apiUrl}/offers/${customerId}`);
  }
}
