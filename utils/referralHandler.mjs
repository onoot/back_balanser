import User from '../models/User.mjs';

/**
 * Обрабатывает реферальную систему.
 * @param {Object} data - Данные пользователя и реферала.
 * @param {Object} data.user - Новый пользователь.
 * @param {string|null} data.ref - Telegram ID реферера (пригласившего пользователя).
 * @returns {Promise<Object>} Результат обработки.
 */
export async function processReferral({ user, ref }) {
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
        referral: ref || null, // Сохраняем ID реферера (если есть)
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
