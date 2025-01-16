import express from 'express';
import path from 'path';

import { 
    userAll,
} from '../controllers/admin.mjs';

const router = express.Router();

router.get('/users', userAll);

export default router;
