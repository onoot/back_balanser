import User from '../models/User.mjs';
import Role from '../models/Role.mjs';
import Task from '../models/Task.mjs';
import Daily from '../models/Daily.mjs';
import DailyCombo from '../models/DailyCombo.mjs';


export const userAll = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['name'],
                },
            ],
        });
        //посчитать сколько всегро пользователей, сколько пригласили людей и сколько из них подключили кошелек
        const user_count = users.length;
        const invited_count = users.filter(user => user.Invited).length;
        const invited_wallet_count = users.filter(user => user.Invited && user.wallet).length;
        const invited_wallet_percent = invited_wallet_count / invited_count * 100;
        const invited_percent = invited_count / user_count * 100;
        res.json({ users, user_count, invited_count, invited_wallet_count, invited_wallet_percent, invited_percent });

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};