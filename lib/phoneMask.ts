/**
 * Форматирует номер телефона в формат +7 (XXX) XXX-XX-XX
 */
export function formatPhoneNumber(value: string): string {
  // Удаляем все нецифровые символы
  const numbers = value.replace(/\D/g, '');
  
  // Если номер начинается с 8, заменяем на 7
  let formatted = numbers.startsWith('8') ? '7' + numbers.slice(1) : numbers;
  
  // Если номер не начинается с 7, добавляем 7
  if (formatted && !formatted.startsWith('7')) {
    formatted = '7' + formatted;
  }
  
  // Ограничиваем до 11 цифр (7 + 10 цифр)
  formatted = formatted.slice(0, 11);
  
  // Форматируем: +7 (XXX) XXX-XX-XX
  if (formatted.length === 0) {
    return '';
  } else if (formatted.length <= 1) {
    return `+${formatted}`;
  } else if (formatted.length <= 4) {
    return `+7 (${formatted.slice(1)}`;
  } else if (formatted.length <= 7) {
    return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4)}`;
  } else if (formatted.length <= 9) {
    return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7)}`;
  } else {
    return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7, 9)}-${formatted.slice(9, 11)}`;
  }
}

/**
 * Извлекает только цифры из номера телефона
 */
export function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Валидирует номер телефона (должен быть +7 и 10 цифр после 7)
 */
export function validatePhoneNumber(value: string): boolean {
  const digits = getPhoneDigits(value);
  return digits.startsWith('7') && digits.length === 11;
}
