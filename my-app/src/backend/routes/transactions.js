const express = require("express");
const router = express.Router();

// Hardcoded transactions data
const transactions = [
    { customerId: "123", location: "Amazon", amount: 120.99, cardType: "Visa" },
    { customerId: "123", location: "Walmart", amount: 45.50, cardType: "MasterCard" },
    { customerId: "123", location: "Netflix", amount: 5.99, cardType: "Visa" },
    { customerId: "123", location: "Apple Store", amount: 999, cardType: "Amex" },
    { customerId: "123", location: "Uber", amount: 15.75, cardType: "Visa" },
    { customerId: "123", location: "Target", amount: 78.49, cardType: "MasterCard" },
  
    { customerId: "456", location: "Prime", amount: 5.99, cardType: "MasterCard" },
    { customerId: "456", location: "Starbucks", amount: 5.99, cardType: "Visa" },
    { customerId: "456", location: "Dominos", amount: 22.99, cardType: "Visa" },
    { customerId: "456", location: "Nike", amount: 134.50, cardType: "MasterCard" },
    { customerId: "456", location: "eBay", amount: 49.99, cardType: "Amex" },
  
    { customerId: "789", location: "Hulu", amount: 7.99, "cardType": "Visa" },
    { customerId: "789", location: "Costco", amount: 250.00, "cardType": "MasterCard" },
    { customerId: "789", location: "McDonald's", amount: 12.89, cardType: "Visa" },
    { customerId: "456", location: "Best Buy", amount: 299.99, cardType: "Amex" },
    { customerId: "789", location: "Spotify", amount: 9.99, cardType: "Visa" }
];

// Get transactions by customerId
router.get("/:customerId", (req, res) => {
  const customerTransactions = transactions.filter(t => t.customerId === req.params.customerId);
  res.json(customerTransactions);
});

module.exports = router;
