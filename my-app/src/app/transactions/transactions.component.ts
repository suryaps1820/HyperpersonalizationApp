import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CustomerDataService } from '../Service/customer-data.service';

import { Chart } from 'chart.js/auto';
interface Transaction{
  purchase_platform: string,
  amount: number,
  payment_mode: string
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  imports: [CommonModule, CurrencyPipe],
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit, AfterViewInit {


  transactions : Transaction[] =[];

  showPieChart: boolean = true;
  pieChartInstance: any;
  barChartInstance: any;

  constructor(private customerService: CustomerDataService) {}

  ngOnInit() {
    this.customerService.customerId$.subscribe(customerId => {
      if (customerId) {
        this.fetchTransactions(customerId);
      }
    });
  }

  ngAfterViewInit() {
    this.createPieChart();
  }

  toggleChart() {
    this.showPieChart = !this.showPieChart;
  
    setTimeout(() => {
      // Ensure old charts are destroyed before rendering new ones
      if (this.pieChartInstance) this.pieChartInstance.destroy();
      if (this.barChartInstance) this.barChartInstance.destroy();
  
      if (this.showPieChart) {
        this.createPieChart();
      } else {
        this.createBarChart();
      }
    }, 0);
  }
  
  fetchTransactions(customerId: string) {
  console.log(`Fetching transactions for Customer ID: ${customerId}`);
  this.customerService.getTransactions(customerId).subscribe((transactionList: Transaction[]) => {
    this.transactions = [];
    for (let x of transactionList) { 
      let transaction: Transaction = { 
        purchase_platform: x.purchase_platform,
        amount: x.amount,
        payment_mode: x.payment_mode
      };
      console.log("fetched transactions from backend : " +transaction.purchase_platform + transaction.amount+ transaction.payment_mode);
      this.transactions.push(transaction);
    }
  });    
    this.toggleChart();
  }

  createPieChart() {
    const cardUsageData = this.aggregateCardUsage();
    
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!ctx) return; // Prevent error if the element is not found
    
    this.pieChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(cardUsageData),
        datasets: [{
          data: Object.values(cardUsageData),
          backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0']
        }]
      }
    });
  }
  
  createBarChart() {
    const labels = this.transactions.map(t => t.purchase_platform);
    const data = this.transactions.map(t => t.amount);
  
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    if (!ctx) return;
      ctx.style.height = "200px";
  
    this.barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Transaction Amounts',
          data: data,
          backgroundColor: '#36a2eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  

  aggregateCardUsage() {
    const cardCounts: { [key: string]: number } = {};

    this.transactions.forEach(t => {
      cardCounts[t.payment_mode] = (cardCounts[t.payment_mode] || 0) + 1;
    });

    return cardCounts;
  }
}
