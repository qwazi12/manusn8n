// src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import './services/ai/nodePilotAiService';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [
    'https://nodepilot.dev',
    'https://manusn8n.vercel.app',
    'https://manusn8n-htnlvop0z-qwazi12s-projects.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Initialize NodePilot AI service (importing the module initializes it)

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
