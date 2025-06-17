// Minimal test server to isolate the hanging issue
import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('1. Starting minimal server...');

const app = express();
const port = process.env.PORT || 4000;

console.log('2. Express app created');

app.use(express.json());

console.log('3. Middleware added');

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Minimal server running' });
});

console.log('4. Routes added');

// Start server
app.listen(port, () => {
  console.log(`5. ✅ Minimal server running on port ${port}`);
});

console.log('6. Server listen called');
