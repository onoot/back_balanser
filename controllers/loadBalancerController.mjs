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

        // Ошибка при балансировке
        res.status(500).send(`Error forwarding request: ${error}`);
    }
}
