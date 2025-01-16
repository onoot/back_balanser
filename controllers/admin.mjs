import { Op } from 'sequelize';
import User from '../models/User.mjs';
import Role from '../models/Role.mjs';
import Task from '../models/Task.mjs';
import Daily from '../models/Daily.mjs';
import DailyCombo from '../models/DailyCombo.mjs';
import Message from '../models/Message.mjs';


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

export const taskAll = async (req, res) => {
    try {
        const task = await Daily.findAll();
        const combo = await DailyCombo.findAll();
        res.json({task:task,  combo: combo});
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export const generate = async (req, res) => {
    try {
        const { data } = req.body;

        // Проверка: является ли data массивом
        if (!Array.isArray(data)) {
            return res.status(400).json({ message: 'Invalid input data: expected an array' });
        }

        // Сохранить объекты в базу данных параллельно
        await Promise.all(data.map((item) => DailyCombo.create(item)));

        res.status(201).json({ message: 'Data successfully saved' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const hellomessage = async (req, res) => {
    try {
        const { data } = req.body;

        // Сохранить объект в базу данных
        await Message.create({ data });

        res.status(201).json({ message: 'Data successfully saved' });
    } catch (error) {
        const { data } = req.body;

        console.error('Database error:', error);
        console.error('Database error:', data);
        res.status(500).json({ message: 'Internal server error' });
    }
};