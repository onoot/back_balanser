import fetch from 'node-fetch';
import Server from '../models/Server.mjs';

/**
 * Проверка состояния серверов.
 * @async
 */
export async function checkServers() {
    const servers = await Server.findAll();

    for (const server of servers) {
        try {
            const response = await fetch('http://'+server.address+'/health', { timeout: 3000 });
            if (response.ok) {
                // Сервер доступен
                if (!server.active) {
                    server.active = true;
                    server.reason = null;
                    await server.save();
                }
            } else {
                // Сервер не отвечает корректно
                server.active = false;
                server.reason = `Status code: ${response.status}`;
                await server.save();
                console.log(`Статус, ебать его, ${server.address} is not available: ${error.message}\naddress: ${response}`);
            }
        } catch (error) {
            // Сервер недоступен
            server.active = false;
            server.reason = error.message;
            console.log(`Сервер, ебать его, ${server.address} is not available: ${error.message}`);
            await server.save();
        }
    }
}

/**
 * Запуск периодической проверки серверов.
 * @param {number} intervalMs - Интервал в миллисекундах.
 */
export function startHealthCheck(intervalMs = 30000) {
    setInterval(checkServers, intervalMs);
    console.log(`Health check started with an interval of ${intervalMs / 1000} seconds.`);
}
