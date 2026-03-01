import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes/auth.routes";
import userRoutes from "./routes/userRoutes/user.routes";
import vendorRoutes from "./routes/vendorRoutes/vendor.routes";
import categoryRoutes from "./routes/categoryRoutes/category.routes";
import tripRoutes from "./routes/tripRoutes/trip.routes";
import adminRoutes from "./routes/adminRoutes/admin.routes";
import reviewRoutes from "./routes/reviewRoutes/review.routes";

dotenv.config();

const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGINS = ['http://localhost:5173'];

const app = express();

// CORS configuration - MUST be first middleware
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie']
}));


app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/check", (_req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api", categoryRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);

// Connect to database and start server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`khachale app listening on port ${PORT}`);
      console.log(`CORS enabled for origins: ${ALLOWED_ORIGINS.join(', ')}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
