import { Component } from '@angular/core';
import { CustomerDataService } from '../Service/customer-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule,FormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  customerId: string = '1020';

  constructor(private customerService: CustomerDataService) {}

  onSearch() {
    if (this.customerId.trim()) {
      this.customerService.setCustomerId(this.customerId);
    }
  }
}
