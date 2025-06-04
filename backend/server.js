import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors'
import connectDB from "./config/db.js";
import 'dotenv/config' 

import userRouter from "./routes/userRouter.js";
import sellerRouter from "./routes/sellerRouter.js";
import connectCloudinary from "./config/Cloudniary.js";
import productRouter from "./routes/ProduuctRouter.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addessRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { stripeWebhooks } from "./controllers/ordercontroller.js";




const app = express();
const PORT = process.env.PORT || 3000;




await connectDB();
await connectCloudinary();



const allowedOrigins = ['http://localhost:5173']

app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)
app.use(express.json());
app.use(cookieParser());




app.use(cors({origin:allowedOrigins,credentials:true}))





app.use('/api/user',userRouter)
app.use('/api/seller',sellerRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/address',addressRouter)
app.use('/api/order',orderRouter)

app.get("/", (req, res) => {
  res.send("Hello, server is running");
});


app.listen(PORT,()=>{
  console.log(`app is run on this port${PORT}`);
}) 