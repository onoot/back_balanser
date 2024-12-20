import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  charset: 'utf8mb4',
  pool: {
    max: 100, // Максимальное количество соединений
    min: 0,  // Минимальное количество соединений
    acquire: 30000, // Максимальное время ожидания соединения (мс)
    idle: 5000 // Время простоя перед закрытием соединения (мс)
  }
});


export async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Синхронизация всех моделей (создание таблиц, если их еще нет)
    await sequelize.sync({ alter: true }); 
    // Используйте { alter: true } для обновления структуры таблиц по моделям, если это необходимо
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// syncDatabase();

export default sequelize;
