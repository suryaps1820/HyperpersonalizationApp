const express = require("express");
const router = express.Router();

// Hardcoded transactions data
const transactions = [
  { customerId: "123", location: "Amazon", amount: 120.99, cardType: "Visa" },
  { customerId: "123", location: "Walmart", amount: 45.50, cardType: "MasterCard" },
  { customerId: "123", location: "Netflix", amount: 5.99, cardType: "Visa" },
  { customerId: "456", location: "Prime", amount: 5.99, cardType: "MasterCard" },
  { customerId: "456", location: "Starbucks", amount: 5.99, cardType: "Visa" },
  { customerId: "456", location: "Best Buy", amount: 299.99, cardType: "Amex" },
  { customerId: "789", location: "Spotify", amount: 9.99, cardType: "Visa" },
];

// Get transactions by customerId
router.get("/:customerId", (req, res) => {
    console.log(req);
  const customerTransactions = transactions.filter(t => t.customerId === req.params.customerId);
  console.log("backend response : "+ res.location + res.amount);
  res.json(customerTransactions);
});

module.exports = router;
