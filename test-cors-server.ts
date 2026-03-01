import express from "express";
import cors from "cors";

const app = express();
const PORT = 5001; // Different port to test

const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

// Simple CORS test
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));

app.get('/test', (req, res) => {
  res.json({ message: 'CORS test successful', origin: req.headers.origin });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test with: curl -H "Origin: http://localhost:5173" http://localhost:${PORT}/test`);
});
