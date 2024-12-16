import fetch from 'node-fetch';
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
            method: req.method, // Переносим исходный HTTP-метод
            headers: {
                ...req.headers, // Переносим заголовки
                host: new URL(targetUrl).host, // Изменяем хост
            },
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        };

        // Перенаправление запроса
        const response = await fetch(targetUrl, options);

        // Ответ от целевого сервера
        const responseData = await response.text();

        res.status(response.status).send(responseData);
        console.log(`Forwarded ${req.method} request to ${targetUrl} with status ${response.status}`);
    } catch (error) {
        console.error('Error forwarding request:', error.message);
        res.status(500).send(`Unable to forward request: ${error.message}`);
    }
}
