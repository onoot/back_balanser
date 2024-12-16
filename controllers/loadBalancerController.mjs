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
    let test
    try {
        const server = await getAvailableServer();
        const targetUrl = `http://${server.address}/${req.url}`;
        const options = {
            method: req.method,
            headers: { ...req.headers },
            body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
        };
        test=targetUrl
        const response = await fetch(targetUrl, options);
        const responseData = await response.text();
        res.status(response.status).send(responseData);
        console.log(`Forwarded request to ${targetUrl} with status ${response.status}`);
    } catch (error) {
        console.error('Error forwarding request:', error.message, "\n"+test);
        res.status(500).send('Unable to forward request: ' + error.message+"\n"+test);
    }
}
