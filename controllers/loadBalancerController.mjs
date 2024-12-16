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
 * @param {Function} next - Следующий middleware.
 */
export async function balanceRequest(req, res, next) {
    try {
        const server = await getAvailableServer();
        const targetUrl = `http://${server.address}${req.url}`;

        console.log(`Епта метод ${req.method} request to ${targetUrl}`);
        // Копируем тело запроса (если требуется)
        const body =
            ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase()) && req.body
                ? JSON.stringify(req.body)
                : undefined;

        // Параметры запроса
        const options = {
            method: req.method,
            headers: {
                ...req.headers,
                'Content-Type': req.headers['content-type'] || 'application/json',
            },
            body,
        };

        // Перенаправляем запрос
        const response = await fetch(targetUrl, options);

        // Читаем данные ответа
        const responseData = await response.text();

        // Отправляем ответ клиенту
        res.status(response.status).send(responseData);
        console.log(`Forwarded ${req.method} request to ${targetUrl} with status ${response.status}`);
    } catch (error) {
        console.error('Error forwarding request:', error.message);
        res.status(500).send(`Unable to forward request: ${error.message}`);
    }
}
