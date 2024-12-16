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
export async function balanceRequest(req, res) {
    try {
        const server = await getAvailableServer();
        const targetUrl = `http://${server.address}${req.url}`;

        // Настройки запроса для перенаправления
        const options = {
            method: req.method,               // Метод запроса (POST, GET и т.д.)
            url: targetUrl,                   // Целевой URL
            headers: { ...req.headers },      // Копирование заголовков из оригинального запроса
            data: req.body || undefined,     // Тело запроса для методов POST, PUT, PATCH
        };

        // Перенаправление запроса
        const response = await axios(options);

        // Ответ от целевого сервера
        res.status(response.status).send(response.data);
        console.log(`Forwarded ${req.method} request to ${targetUrl} with status ${response.status}`);
    } catch (error) {
        console.error('Error forwarding request:', error.message);
        const errorDetails = error.response ? error.response.data : error.message;
        res.status(500).send(`Unable to forward request: ${errorDetails}`);
    }
}
