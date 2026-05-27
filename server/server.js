const express = require('express');
const { Telegraf } = require('telegraf');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);

// Хранилище кодов (временно, в памяти)
// Для продакшена используй Redis или базу данных
const codes = new Map();

// Генерация 6-значного кода
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// API: отправка кода в Telegram
app.post('/api/send-code', async (req, res) => {
  const { telegramId, phone } = req.body;
  
  if (!telegramId) {
    return res.status(400).json({ error: 'telegramId обязателен' });
  }
  
  const code = generateCode();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 минут
  
  codes.set(phone || telegramId, { code, expiresAt });
  
  try {
    await bot.telegram.sendMessage(
      telegramId,
      `🔐 *Ваш код подтверждения:*\n\`${code}\`\n\nНикому не сообщайте этот код!\nКод действителен 5 минут.`,
      { parse_mode: 'Markdown' }
    );
    
    // Отладка: выводим код в консоль для тестирования
    console.log(`✅ Код ${code} отправлен пользователю ${telegramId}`);
    
    res.json({ 
      success: true, 
      message: 'Код отправлен в Telegram',
      // ВАЖНО: в продакшене НЕ возвращай код! Только для отладки:
      devCode: process.env.NODE_ENV === 'development' ? code : undefined
    });
  } catch (error) {
    console.error('Ошибка отправки:', error);
    res.status(500).json({ error: 'Не удалось отправить сообщение' });
  }
});

// API: проверка кода
app.post('/api/verify-code', (req, res) => {
  const { identifier, code } = req.body;
  
  const record = codes.get(identifier);
  
  if (!record) {
    return res.status(400).json({ error: 'Код не найден или истёк' });
  }
  
  if (record.expiresAt < Date.now()) {
    codes.delete(identifier);
    return res.status(400).json({ error: 'Код истёк' });
  }
  
  if (record.code !== code) {
    return res.status(400).json({ error: 'Неверный код' });
  }
  
  // Код верный — удаляем его
  codes.delete(identifier);
  
  res.json({ success: true, message: 'Код подтверждён' });
});

// Тестовый эндпоинт
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', botRunning: !!bot });
});

// Запуск бота и сервера
async function start() {
  try {
    // Запускаем бота
    await bot.launch();
    console.log('🤖 Telegram бот запущен');
    
    // Запускаем сервер
    app.listen(process.env.PORT || 3001, () => {
      console.log(`🚀 Сервер запущен на порту ${process.env.PORT || 3001}`);
    });
  } catch (error) {
    console.error('Ошибка запуска:', error);
  }
}

// Обработка завершения
process.on('SIGINT', () => {
  bot.stop('SIGINT');
  process.exit();
});

start();