import { AfterViewInit, Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  imports: [CommonModule, CurrencyPipe],
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements AfterViewInit {
  transactions = [
    { location: "Amazon", amount: 120.99, cardType: "Visa" },
    { location: "Walmart", amount: 45.50, cardType: "MasterCard" },
    { location: "Starbucks", amount: 5.99, cardType: "Visa" },
    { location: "Best Buy", amount: 299.99, cardType: "Amex" },
    { location: "Spotify", amount: 9.99, cardType: "Visa" },
    { location: "Nike", amount: 135.75, cardType: "MasterCard" }
  ];

  showPieChart: boolean = true;
  pieChartInstance: any;
  barChartInstance: any;

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
    const labels = this.transactions.map(t => t.location);
    const data = this.transactions.map(t => t.amount);
  
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    if (!ctx) return;
  
    // **Clear previous chart height** before creating a new one
    ctx.style.height = "200px"; // Fixed height
  
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
      cardCounts[t.cardType] = (cardCounts[t.cardType] || 0) + 1;
    });

    return cardCounts;
  }
}
