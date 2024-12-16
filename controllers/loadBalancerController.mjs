export async function balanceRequest(req, res, next) {
    try {
        // Выбираем доступный сервер
        const server = await getAvailableServer();
        console.log(`Selected server: ${server.address}`);

        const targetUrl = `http://${server.address}${req.url}`;
        console.log(`Forwarding request to ${targetUrl}`);

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
        res.status(response.status).send(response.data || null);
        console.log(`Forwarded ${req.method} request to ${targetUrl} with status ${response.status}`);
    } catch (error) {
        console.error('Error forwarding request:', error.message);

        if (res.headersSent) {
            // Если заголовки уже отправлены, передаём ошибку дальше
            return next(error);
        }

        // Если ошибка вызвана отсутствием ресурса (404)
        if (error.response && error.response.status === 404) {
            return res.status(404).send('Resource not found on target server.');
        }

        // Обработка других ошибок
        const errorDetails = error.response ? error.response.data : error.message;
        res.status(500).send(`Error forwarding request: ${errorDetails}`);
    }
}
