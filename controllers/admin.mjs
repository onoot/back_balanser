import { Op } from 'sequelize';
import User from '../models/User.mjs';
import Role from '../models/Role.mjs';
import Task from '../models/Task.mjs';
import Daily from '../models/Daily.mjs';
import DailyCombo from '../models/DailyCombo.mjs';


export const userAll = async (req, res) => {
    try {
        const user_count = await User.count();
        const invited_count = await User.count({ where: { Invited: { [Op.not]: null } } });
        const wallet_count = await User.count({ where: { wallet: { [Op.not]: null } } });
        
        res.json({ user_count, invited_count, wallet_count });
        
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};