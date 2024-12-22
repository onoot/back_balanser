import User from '../models/User.mjs';

/**
 * Обрабатывает реферальную систему.
 * @param {Object} data - Данные пользователя и реферала.
 * @param {Object} data.user - Новый пользователь.
 * @param {string|null} data.ref - Telegram ID реферера (пригласившего пользователя).
 * @returns {Promise<Object>} Результат обработки.
 */
export async function processReferral({ user, ref, isPremium }) {
  try {
    // Проверяем, существует ли пользователь
    let newUser = await User.findOne({ where: { telegramId: user.id } });

    if (!newUser) {
      // Создаём нового пользователя
      newUser = await User.create({
        telegramId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        name: user.username || 'Guest',
        referral: ref, // Сохраняем ID реферера (если есть)
      });
    }

    // Если реферальный ID указан
    if (ref) {
      // Находим пользователя-реферера
      const referrer = await User.findOne({ where: { telegramId: ref } });

      if (referrer) {
        // Добавляем нового пользователя в список приглашённых
        const invitedList = referrer.Invited ? referrer.Invited.split(',') : [];
        if (!invitedList.includes(user.id.toString())) {
          invitedList.push(user.id.toString());
          referrer.Invited = invitedList.join(',');

          // Определяем, премиум ли пользователь
          const keyToAdd = true ? 3 : 1; // Если премиум, добавляем 3, иначе 1
          referrer.key += keyToAdd;

          await referrer.save();
        }
      }
    }

    return { success: true, newUser };
  } catch (error) {
    console.error('Error in processReferral:', error);
    return { success: false, error: error.message };
  }
}
