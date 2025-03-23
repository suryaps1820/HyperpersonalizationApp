const express = require("express");
const router = express.Router();

// Hardcoded offers data
const offers = [
  { customerId: "123", title: "Special Offer!", details: "Get 50% off on all products." },
  { customerId: "123", title: "New Arrivals!", details: "Check out our latest collection." },
  { customerId: "123", title: "Exclusive Discount!", details: "Collect it at 25% discount" },
  { customerId: "456", title: "New Arrivals!", details: "Check out our latest collection." },
  { customerId: "789", title: "Exclusive Discount!", details: "Sign up today and get 20% off." },
];

// Get offers by customerId
router.get("/:customerId", (req, res) => {
    console.log(req);
  const customerOffers = offers.filter(o => o.customerId === req.params.customerId);
  console.log("backend response : "+ res.title + res.details);
  res.json(customerOffers);
});

module.exports = router;
