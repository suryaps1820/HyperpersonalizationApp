import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerDataService {

  private customerIdSource = new BehaviorSubject<string>('12345');
  customerId$ = this.customerIdSource.asObservable();

  setCustomerId(id: string) {
    this.customerIdSource.next(id);
  }
}
