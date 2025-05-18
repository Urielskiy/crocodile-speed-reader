/**
 * Splits text into words and sentences for the Crocodile exercise
 */

/**
 * Splits text into individual words
 */
export const splitIntoWords = (text: string): string[] => {
  // Remove extra whitespace and split by spaces
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(word => word.length > 0);
};

/**
 * Splits text into lines with a specific number of lines
 * Змінена логіка, щоб забезпечити послідовне зникнення рядків
 */
export const splitIntoLines = (words: string[], lineCount: number): string[][] => {
  const lines: string[][] = [];
  
  // Якщо lineCount = 1, просто повертаємо всі слова в одному рядку
  if (lineCount === 1) {
    return [words];
  }
  
  // Розраховуємо приблизну кількість слів у кожному рядку
  // Використовуємо фіксовану довжину рядка, щоб уникнути розбиття на абзаци
  const wordsPerLine = Math.ceil(words.length / lineCount);
  
  // Розбиваємо слова на рядки послідовно
  let currentIndex = 0;
  
  while (currentIndex < words.length) {
    const endIndex = Math.min(currentIndex + wordsPerLine, words.length);
    lines.push(words.slice(currentIndex, endIndex));
    currentIndex = endIndex;
    
    // Якщо досягли потрібної кількості рядків, зупиняємося
    if (lines.length >= lineCount) {
      break;
    }
  }
  
  return lines;
};

/**
 * Calculates the total exercise duration in seconds based on word count and speed
 */
export const calculateExerciseDuration = (wordCount: number, wordsPerMinute: number): number => {
  return (wordCount / wordsPerMinute) * 60;
};

/**
 * Calculates the delay between words in milliseconds based on words per minute
 */
export const calculateWordDelay = (wordsPerMinute: number): number => {
  // Convert words per minute to milliseconds per word
  return (60 / wordsPerMinute) * 1000;
};
