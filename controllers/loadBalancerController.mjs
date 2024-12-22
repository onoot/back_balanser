import axios from 'axios';
import Server from '../models/Server.mjs';

let currentServerIndex = 0;

/**
 * Выбор доступного сервера из списка по кругу.
 * @async
 * @returns {Promise<Object>} Данные о сервере.
 */
export async function getAvailableServer() {
    const servers = await Server.findAll({ where: { active: true } });
    if (servers.length === 0) {
        throw new Error("No available servers");
    }

    // Выбираем сервер по индексу
    const server = servers[currentServerIndex];

    // Увеличиваем индекс, чтобы использовать следующий сервер в будущем
    currentServerIndex = (currentServerIndex + 1) % servers.length;

    return server;
}

/**
 * Балансировка запросов к API.
 * @param {Object} req - Запрос.
 * @param {Object} res - Ответ.
 * @param {Function} next - Следующий middleware.
 */
export async function balanceRequest(req, res, next) {
    let targetUrl;
    try {
        // Выбираем доступный сервер
        const server = await getAvailableServer();
        console.log(`Selected server: ${server.address}`);

        targetUrl = `http://${server.address}${req.url}`;
        console.log(`Forwarding ${req.method} request to ${targetUrl}`);

        // Формируем запрос к целевому серверу
        const options = {
            method: req.method,
            url: targetUrl,
            headers: { ...req.headers }, // Передаем заголовки
            data: req.body || undefined, // Тело запроса
            params: req.query || undefined, // Query-параметры
        };

        // Выполняем запрос к целевому серверу
        const response = await axios(options);

        // Логируем успешный ответ
        console.log(`Forwarded ${req.method} request to ${targetUrl} with status ${response.status}`);

        // Пересылаем ответ клиенту
        res.status(response.status).set(response.headers).send(response.data);
    } catch (error) {
        console.error('Error forwarding request:', error.message);

        if (res.headersSent) {
            // Если заголовки уже отправлены, передаём ошибку дальше
            return next(error);
        }

        // Если ошибка произошла на стороне целевого сервера, передаём код и данные об ошибке
        if (error.response) {
            const { status, data, headers } = error.response;
            console.error(`Server error: ${status} - ${data}`);
            return res.status(status).set(headers).send(data);
        }

        // Если ошибка произошла на стороне балансировщика
        res.status(500).send(`Error forwarding request: ${error.message}`);
    }
}

