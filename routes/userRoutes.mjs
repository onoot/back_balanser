import express from 'express';
import path from 'path';

import { 
    userAll,
    taskAll,
    
} from '../controllers/admin.mjs';

const router = express.Router();

router.get('/users', userAll);

router.get('/tasks', taskAll);

export default router;
