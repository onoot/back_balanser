import express from 'express';
import path from 'path';

import { 
    userAll,
    taskAll,
    generate,
    hellomessage,
    

} from '../controllers/admin.mjs';

const router = express.Router();

router.get('/users', userAll);

router.get('/tasks', taskAll);

router.post('/generate', generate);


router.post('/hellomessage', hellomessage);

export default router;
