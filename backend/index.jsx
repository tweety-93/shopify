const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");


app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.post("/api/create-checkout-sessions", async (req, res) => {
  const { products, customer } = req.body;

  const stripeCustomer = await stripe.customers.create({
      name: customer.name,
      address: {
        line1: customer.address.line1,
        city: customer.address.city,
        postal_code: customer.address.postal_code,
        country: customer.address.country,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: products.map((product) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: product.title,
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/Payment`,
      cancel_url: `${process.env.CLIENT_URL}/Cancel`,
      customer: stripeCustomer.id,
    });

    res.json({ id: session.id });
  
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
