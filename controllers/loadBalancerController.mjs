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

        // Логируем дополнительные данные запроса
        console.log(`Request body:`, req.body);
        console.log(`Request query:`, req.query);
        console.log(`Request headers:`, req.headers);

        // Формируем запрос к целевому серверу
        const options = {
            method: req.method,
            url: targetUrl,
            headers: { ...req.headers }, // Передаем заголовки
            data: req.body || undefined, // Тело запроса
            params: req.query || undefined, // Query-параметры
        };

        const response = await axios(options);

        // Логируем успешный ответ
        console.log(`Forwarded ${req.method} request to ${targetUrl} with status ${response.status}`);
        
        // Если сервер вернул HTML (например, 404 страница)
        if (response.headers['content-type'] && response.headers['content-type'].includes('text/html')) {
            res.status(response.status).send(response.data); // Отправляем HTML как есть
        } else {
            res.status(response.status).send(response.data || null);
        }
    } catch (error) {
        console.error('Error forwarding request:', error.message);

        // Логируем детали ошибки
        if (error.response) {
            console.error('Error response:', error.response);
        }

        if (res.headersSent) {
            // Если заголовки уже отправлены, передаём ошибку дальше
            return next(error);
        }

        // Если ошибка вызвана отсутствием ресурса (404)
        if (error.response && error.response.status === 404) {
            console.error(`Resource not found at ${targetUrl}`);
            return res.status(404).send('Resource not found on target server.');
        }

        // Обработка других ошибок
        const errorDetails = error.response ? error.response.data : error.message;
        res.status(500).send(`Error forwarding request: ${errorDetails}`);
    }
}
