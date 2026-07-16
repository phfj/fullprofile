import 'dotenv/config';
import express from 'express';
import { AuthService } from './lib/auth.services';
import { requireAuth, AuthenticatedRequest } from './middleware/auth.middleware';

const app = express();
const port = process.env.PORT || 3000;

//Middlwware to parse incoming JSON request bodies
app.use(express.json());

//Use our framework-agnostic Auth Service
const authService = AuthService;

// ==========================================
// PUBLIC ROUTES
// ==========================================

//1. Sign Up Route
app.post('/api.auth/singup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
});