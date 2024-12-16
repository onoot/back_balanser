import axios from 'axios';
import Server from '../models/Server.mjs';

/**
 * Выбор доступного сервера из списка.
 * @async
 * @returns {Promise<Object>} Данные о сервере.
 */
export async function getAvailableServer() {
    const servers = await Server.findAll({ where: { active: true } });
    if (servers.length === 0) {
        throw new Error("No available servers");
    }
    return servers[Math.floor(Math.random() * servers.length)];
}

/**
 * Балансировка запросов к API.
 * @param {Object} req - Запрос.
 * @param {Object} res - Ответ.
 */

/**
 * Балансировка запросов к API.
 * @param {Object} req - Запрос.
 * @param {Object} res - Ответ.
 * @param {Function} next - Следующий middleware.
 */
export async function balanceRequest(req, res, next) {
    try {
        // Выбираем сервер
        const server = getAvailableServer();
        if (!server) {
            res.status(503).send('No available servers');
        }

        const targetUrl = `http://${server.address}${req.url}`;

        // Формируем запрос к целевому серверу
        const options = {
            method: req.method,
            url: targetUrl,
            headers: { ...req.headers }, // Передаем заголовки
            data: req.body || undefined, // Тело запроса
            params: req.query || undefined, // Query-параметры
        };

        const response = await axios(options);

        // Возвращаем ответ от целевого сервера
        res.status(response.status).send(response.data);

        console.log(`Forwarded ${req.method} request to ${targetUrl} with status ${response.status}`);
    } catch (error) {
        console.error('Error forwarding request:', error.message);
        const errorDetails = error.response ? error.response.data : error.message;
        res.status(500).send(`Error forwarding request: ${errorDetails}`);
    }
}
