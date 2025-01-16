import express from 'express';
import path from 'path';

import { 
    userAll,
    taskAll,
    generate

} from '../controllers/admin.mjs';

const router = express.Router();

router.get('/users', userAll);

router.get('/tasks', taskAll);

router.post('/generate', generate);

export default router;
