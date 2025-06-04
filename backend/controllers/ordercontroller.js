import { request, response } from "express";
import Order from "../models/order.js";
import Product from "../models/Product.js";
import User from '../models/User.js'
import Stripe from "stripe";


const stripeInstance = new Stripe(process.env.STRIPE_SCRECT_KEY); 

export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (!address || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    let productData = [];
    let amount = 0;

    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // 2% service charge

    // Create order first, so you have order._id for Stripe metadata
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      isPaid: false,
      status: "Pending Payment",
    });

    const line_items = productData.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.floor(item.price * 1.02 * 100), // amount in cents including 2% service charge
      },
      quantity: item.quantity,
    }));

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.status(201).json({ success: true, url: session.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};






// Place Order - COD
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;  // Added userId extraction

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let amount = 0;

    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }
      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // Add 2% service charge

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get Orders for a User
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.query; // ✅ Use query instead of body

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};



export const stripeWebhooks = async (req,res)=>{
  const stripeInstance = new Stripe(process.env.STRIPE_SCRECT_KEY);
  const sig = req.headers["stripe-signature"];

  let event;
  try{
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }

  catch(error){
    response.status(400).send(`webHook Error: ${error.message}`)
  }

  switch(event.type){
    case "payment_intent.succeeded":{
      const paymentIntent = event.data.object;
      const paymentIntentID = paymentIntent.id;

      const session  = await stripeInstance.checkout.sessions.list({
        payment_intent : paymentIntentID,

      });
      const {orderId,userId} = session.data[0].metadata;


      await Order.findByIdAndUpdate(orderId,{isPaid : true})

      await User.findByIdAndUpdate(userId,{cartItems:{}});
      break;

    }
     case "payment_intent.payment_failed":{
         const paymentIntent = event.data.object;
      const paymentIntentID = paymentIntent.id;

      const session  = await stripeInstance.checkout.sessions.list({
        payment_intent : paymentIntentID,

      });
      const {orderId} = session.data[0].metadata;

        await Order.findByIdAndDelete(orderId);
        break;

     }
     default:
      console.error(`Inhandled event type ${event.type}`)
      break;

  }
  response.json({received : true})

}



/**
 * @desc    Get all orders (for seller/admin)
 * @route   GET /api/order/seller
 * @access  Protected (Seller)
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
