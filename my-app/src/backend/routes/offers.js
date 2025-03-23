const express = require("express");
const router = express.Router();

// Hardcoded offers data
const offers = [
  { customerId: "123", title: "Special Offer!", details: "Get 50% off on all products." },
  { customerId: "123", title: "New Arrivals!", details: "Check out our latest collection." },
  { customerId: "123", title: "Exclusive Discount!", details: "Collect it at 25% discount" },
  { customerId: "123", title: "Limited Time Offer!",details: "Buy one, get one free on select items." },
  { customerId: "123", title: "Holiday Sale!",details: "Enjoy up to 60% off this weekend only." },
  { customerId: "123", title: "Loyalty Rewards!",details: "Earn double points on your next purchase." },

  { customerId: "456", title: "Flash Sale!", details: "Hurry! 40% off on electronics for 24 hours." },
  { customerId: "456", title: "Member Exclusive!", details: "Special access to premium products." },
  { customerId: "456", title: "Free Shipping!", details: "Get free shipping on orders above $50." },
  { customerId: "456", title: "New Arrivals!", details: "Check out our latest collection." },


  { customerId: "789", title: "New Season Collection!", details: "Explore our trendy fall styles." },
  { customerId: "789", title: "Early Bird Discount!", details: "Pre-order now and get 15% off." },
  { customerId: "789", title: "Refer & Earn!", details: "Refer a friend and receive a $10 gift card."},
  { customerId: "789", title: "Exclusive Discount!", details: "Sign up today and get 20% off." },
];

// Get offers by customerId
router.get("/:customerId", (req, res) => {
  const customerOffers = offers.filter(o => o.customerId === req.params.customerId);
  res.json(customerOffers);
});

module.exports = router;
