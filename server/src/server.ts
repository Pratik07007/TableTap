import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { globalRateLimiter } from './middleware/rateLimiter';
import authRouter from './routes/auth.routes';
import { resturantRouter } from './routes/resturant.routes';
import menuItemRouter from './routes/menu.routes';
import orderRouter from './routes/order.routes';
import billingRouter from './routes/billing.routes';
import khaltiRouter from './routes/khalti.routes';
import analyticsRouter from './routes/analytics.routes';
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 8080;

app.use(globalRateLimiter);
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000" || "https://tabletap.pratikdhimal.com.np",
        credentials: true,
    })
);
app.use(cookieParser());

app.use(express.json());

app.use('/api/auth', authRouter);

app.use('/api/resturant', resturantRouter);

app.use('/api/menu-items', menuItemRouter);

app.use('/api/orders', orderRouter);
app.use('/api/billing', billingRouter);
app.use('/api/khalti', khaltiRouter);
app.use('/api/analytics', analyticsRouter);

app.get("/health", (req, res) => {
    res.json({ message: "OK" })
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
