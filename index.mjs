import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { startHealthCheck } from './controllers/healthCheckController.mjs';
import { balanceRequest } from './controllers/loadBalancerController.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import TelegramBot from 'node-telegram-bot-api';
import {processReferral} from './utils/referralHandler.mjs';


dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;
const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

const sslOptions = {
    key: fs.readFileSync('/home/kaseev/conf/web/tongaroo.fun/ssl/tongaroo.fun.key'),
    cert: fs.readFileSync('/home/kaseev/conf/web/tongaroo.fun/ssl/tongaroo.fun.crt'),
};

// Запускаем опрос серверов
startHealthCheck();

app.use('/api', (req, res, next) => {
  console.log(`[API Middleware] Method: ${req.method}, Path: ${req.path}`); // Логируем метод запроса и путь
  balanceRequest(req, res, next); 
});

// Обработка всех остальных запросов
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/ton.json'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
  if (err instanceof URIError) {
      console.error("URIError detected: ", err.message);
      res.status(400).send("Bad Request");
  } else {
      console.error("Unhandled error:", err.message);
      res.status(500).send("Internal Server Error");
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('/start')) {
    const userId = msg.from.id;

    // Проверяем, есть ли реферальный код в ссылке
    const refMatch = text.match(/\/start (\d+)/); // Ожидается: "/start <telegramId>"
    const ref = refMatch ? refMatch[1] : null;
    // Проверяем, является ли пользователь Premium
    // const isPremium = msg.from.is_premium || false;
    const isPremium = true;

    try {
      // Используем утилиту для обработки пользователя
      if(ref==userId){
        await bot.sendMessage(
          chatId,
          `🎉 Welcome to our T2E game! 🦘 Press "/start" to begin earning and compete alongside your friends! 🚀🍀`
        );
        return;
      }
      const result = await processReferral({
        user: {
          id: userId,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name || '',
          username: msg.from.username || '',
        },
        ref,
        isPremium,
      });

      if (result.success) {
        await bot.sendMessage(
          chatId,
          `🎉 Welcome to our T2E game! 🦘 Press "/start" to begin earning and compete alongside your friends! 🚀🍀`
        );
      } else {
        await bot.sendMessage(chatId, 'Failed to process your registration. Please try again later.');
      }
    } catch (error) {
      console.error('Error handling /start command:', error);
      await bot.sendMessage(chatId, 'An error has occurred, please try again later.');
    }
  }
});

// const HTTP_PORT = process.env.HTTP_PORT || 80;

// http.createServer(app).listen(HTTP_PORT, () => {
//         console.log(`HTTP Server started on port ${HTTP_PORT}`);
//     });


const HTTPS_PORT = process.env.HTTPS_PORT || 443;
https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server started on port ${HTTPS_PORT}`);
});

const HTTP_PORT = process.env.HTTP_PORT || 80;
http.createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
}).listen(HTTP_PORT, () => {
    console.log(`HTTP Server started on port ${HTTP_PORT} and redirecting to HTTPS`);
});