import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import { resturantRouter } from './routes/resturant.routes';
import menuItemRouter from './routes/menu.routes';
import orderRouter from './routes/order.routes';
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 8080;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());

app.use('/api/auth', authRouter); 

app.use('/api/resturant', resturantRouter);

app.use('/api/menu-items', menuItemRouter);
app.use('/api/orders', orderRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
