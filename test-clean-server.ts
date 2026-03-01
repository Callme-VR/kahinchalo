import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

dotenv.config();

const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

const app = express();

// Test endpoint first
app.get('/test-cors', (req, res) => {
  console.log('Request origin:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Vary', 'Origin');
  res.json({ message: 'CORS test', origin: req.headers.origin });
});

// CORS middleware
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Other middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic routes
app.post('/api/vendors/login', (req, res) => {
  console.log('Login request origin:', req.headers.origin);
  res.json({
    message: "Vendor logged in successfully",
    user: {
      id: 'test-id',
      name: 'Test Vendor',
      email: 'test@example.com',
      businessName: 'Test Business',
      rating: 4.5,
      totalReviews: 10,
      isVerified: true,
      status: 'PENDING'
    },
    token: 'test-token'
  });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`CORS enabled for: ${ALLOWED_ORIGINS.join(', ')}`);
});
