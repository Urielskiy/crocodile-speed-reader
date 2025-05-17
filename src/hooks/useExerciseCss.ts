import { useState, useRef, useEffect } from 'react';
import { Settings, ExerciseStats } from '../types';
import { splitIntoWords, splitIntoLines } from '../utils/textProcessing';

interface UseExerciseProps {
  text: string;
  settings: Settings;
}

interface UseExerciseReturn {
  isRunning: boolean;
  isPaused: boolean;
  progress: number;
  currentLines: string[][];
  allLines: string[][];
  wordDelayMs: number; // Затримка між словами в мс
  stats: ExerciseStats;
  startExercise: () => void;
  pauseExercise: () => void;
  resumeExercise: () => void;
  stopExercise: () => void;
}

export const useExercise = ({ text, settings }: UseExerciseProps): UseExerciseReturn => {
  // Основні стани вправи
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Час вправи
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Статистика
  const [stats, setStats] = useState<ExerciseStats>({
    duration: 0,
    speed: settings.speed,
    wordsRead: 0,
  });

  // Зберігаємо налаштування в ref для доступу в таймерах
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Розбиваємо текст на слова та рядки
  const words = useRef(splitIntoWords(text)).current;
  const totalWords = useRef(words.length).current;
  
  // Створюємо рядки з слів
  const [lines, setLines] = useState<string[][]>([]);
  const [currentLines, setCurrentLines] = useState<string[][]>([]);
  
  // Ініціалізуємо рядки при першому рендері
  useEffect(() => {
    const newLines = splitIntoLines(words, settings.lineCount);
    setLines(newLines);
    setCurrentLines(newLines.slice(0, settings.lineCount));
  }, [words, settings.lineCount]);

  // Розраховуємо затримку між словами
  const getWordDelay = () => {
    // Затримка між словами не залежить від кількості рядків
    return (60 / settingsRef.current.speed) * 1000;
  };
  
  // Поточна затримка між словами для CSS-анімації
  const [wordDelayMs, setWordDelayMs] = useState(getWordDelay());
  
  // Оновлюємо затримку при зміні швидкості
  useEffect(() => {
    setWordDelayMs(getWordDelay());
  }, [settings.speed]);

  // Таймер для оновлення прогресу
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Зберігаємо кількість прочитаних слів в референсі
  const wordsReadRef = useRef(0);
  
  // Зберігаємо час початку вправи в референсі, щоб мати точну тривалість
  const exerciseStartTimeRef = useRef<number | null>(null);
  
  // Функція для оновлення прогресу
  const updateProgress = () => {
    if (!isRunning || isPaused) return;
    
    const currentTime = Date.now();
    // Переконуємося, що startTime існує
    const validStartTime = startTime || currentTime;
    const totalElapsed = elapsedTime + (currentTime - validStartTime);
    
    // Розраховуємо скільки слів повинно було зникнути за цей час
    // Використовуємо однакову логіку розрахунку незалежно від кількості рядків
    const wordsRead = Math.min(
      Math.floor(totalElapsed / wordDelayMs),
      totalWords
    );
    
    // Зберігаємо максимальну кількість прочитаних слів
    wordsReadRef.current = Math.max(wordsReadRef.current, wordsRead);
    
    // Задаємо прогрес вправи
    setProgress(wordsRead / totalWords);
    
    // Оновлюємо статистику в реальному часі
    const durationInSeconds = totalElapsed / 1000;
    const durationInMinutes = durationInSeconds / 60;
    const actualSpeed = durationInMinutes > 0 
      ? Math.round(wordsRead / durationInMinutes) 
      : settingsRef.current.speed;
    
    // Оновлюємо статистику під час вправи
    setStats({
      duration: Math.round(durationInSeconds),
      speed: actualSpeed,
      wordsRead: wordsRead, // Використовуємо поточну кількість прочитаних слів
    });
    
    // Додаємо логування для відстеження часу
    console.log('Time tracking:', { 
      startTime: new Date(validStartTime).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
      elapsedTime,
      totalElapsed,
      durationInSeconds
    });
    
    // Додаємо логування для відлагодження
    console.log('Progress update:', { 
      totalElapsed, 
      wordDelayMs, 
      wordsRead, 
      totalWords,
      progress: wordsRead / totalWords,
      stats: {
        duration: Math.round(totalElapsed / 1000),
        speed: actualSpeed,
        wordsRead: wordsRead
      }
    });
    
    // Якщо всі слова прочитані або прогрес близький до 100%, зупиняємо вправу і зберігаємо час
    if (wordsRead >= totalWords || progress >= 0.99) {
      console.log('All words have been read, stopping exercise timing');
      
      // Зупиняємо таймер прогресу
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      
      // Розраховуємо теоретичний час на основі кількості слів і швидкості читання
      // Час в секундах = (кількість слів / швидкість в словах за хвилину) * 60
      // Важливо використовувати фактичну кількість прочитаних слів для точного розрахунку
      const theoreticalDurationSec = Math.max(5, Math.ceil((wordsReadRef.current / settingsRef.current.speed) * 60));
      
      // Використовуємо теоретичний час для відображення реального часу читання
      // Це відповідає часу від натискання кнопки Старт до зникнення останнього слова
      // Встановлюємо мінімальне значення 5 секунд, щоб уникнути надто малих значень
      let totalElapsedTime = theoreticalDurationSec * 1000; // Перетворюємо в мілісекунди
      
      console.log('Theoretical duration:', {
        totalWords,
        speed: settingsRef.current.speed,
        durationSeconds: theoreticalDurationSec
      });
      
      // Розраховуємо фактичну швидкість читання
      const finalDuration = Math.round(totalElapsedTime / 1000);
      const durationInMinutes = finalDuration / 60;
      const actualSpeed = durationInMinutes > 0 
        ? Math.round(totalWords / durationInMinutes) 
        : settingsRef.current.speed;
      
      console.log('Final exercise stats:', {
        duration: finalDuration,
        speed: actualSpeed,
        wordsRead: totalWords
      });
      
      // Зберігаємо фінальну статистику
      setStats({
        duration: finalDuration,
        speed: actualSpeed,
        wordsRead: totalWords
      });
      
      // Не переходимо автоматично на екран результатів
      // Чекаємо натискання кнопки "Результати"
      
      // Зупиняємо вправу, але не переходимо на інший екран
      setIsRunning(false);
    }
  };

  // Запуск вправи
  const startExercise = () => {
    // Встановлюємо час початку вправи
    const now = Date.now();
    
    // Скидаємо всі значення до початкових
    setIsRunning(true);
    setIsPaused(false);
    setProgress(0);
    setStartTime(now);
    setElapsedTime(0);
    wordsReadRef.current = 0;
    
    // Зберігаємо час початку вправи в референсі
    // Це важливо для правильного розрахунку загальної тривалості вправи
    exerciseStartTimeRef.current = now;
    console.log('Exercise started at:', new Date(now).toISOString());
    
    // Запускаємо таймер для оновлення прогресу
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    progressTimerRef.current = setInterval(updateProgress, 100);
  };

  // Пауза
  const pauseExercise = () => {
    // Встановлюємо стан паузи
    setIsPaused(true);
    
    // Зберігаємо час, який пройшов з останнього старту
    if (startTime) {
      const now = Date.now();
      const additionalTime = now - startTime;
      console.log('Pausing exercise. Adding time:', additionalTime / 1000, 'seconds');
      setElapsedTime(prev => prev + additionalTime);
      setStartTime(null);
    }
    
    // Зупиняємо таймер
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  // Відновлення після паузи
  const resumeExercise = () => {
    // Встановлюємо час відновлення
    const now = Date.now();
    console.log('Resuming exercise at:', new Date(now).toISOString());
    console.log('Accumulated elapsed time so far:', elapsedTime / 1000, 'seconds');
    
    // Відновлюємо стан
    setIsPaused(false);
    setStartTime(now);
    setWordDelayMs(getWordDelay());
    
    // Відновлюємо таймер
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    progressTimerRef.current = setInterval(updateProgress, 100);
  };

  // Зупинка вправи
  const stopExercise = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Розраховуємо фактичну тривалість вправи
    const currentTime = Date.now();
    
    // Використовуємо час початку вправи з референсу, який встановлюється при старті
    const startTimeToUse = exerciseStartTimeRef.current || currentTime;
    
    // Використовуємо фактичний час від початку вправи до поточного моменту
    console.log('Exercise ended at:', new Date(currentTime).toISOString());
    console.log('Exercise started at:', new Date(startTimeToUse).toISOString());
    
    // Забезпечуємо, що використовується реальний час вправи
    // Додаємо час паузи до загального часу
    let totalElapsed = 0;
    
    if (isPaused) {
      // Якщо вправа на паузі, використовуємо збережений час elapsedTime
      totalElapsed = elapsedTime;
    } else if (startTime) {
      // Якщо вправа запущена, додаємо час від останнього старту
      totalElapsed = elapsedTime + (currentTime - startTime);
    } else {
      // Якщо немає даних про час, використовуємо час від початку вправи
      totalElapsed = currentTime - startTimeToUse;
    }
    
    // В будь-якому випадку вважаємо, що прочитано всі слова в тексті
    const finalWordsRead = totalWords;
    
    // Переконуємося, що час не нульовий
    if (totalElapsed <= 0) {
      // Якщо час нульовий, використовуємо час від початку вправи або мінімальне значення
      const startToEnd = exerciseStartTimeRef.current ? (currentTime - exerciseStartTimeRef.current) : 0;
      totalElapsed = startToEnd > 0 ? startToEnd : 1000; // Мінімум 1 секунда
    }
    
    // Виводимо детальну інформацію про завершення вправи
    const durationSec = Math.round(totalElapsed / 1000);
    console.log('Final duration in seconds:', durationSec);
    
    console.log('Exercise stopped:', { 
      exerciseStartTime: exerciseStartTimeRef.current ? new Date(exerciseStartTimeRef.current).toISOString() : 'unknown',
      endTime: new Date(currentTime).toISOString(),
      totalElapsed, 
      elapsedTime,
      isPaused,
      currentStartTime: startTime ? new Date(startTime).toISOString() : 'null',
      wordDelayMs, 
      finalWordsRead, 
      totalWords,
      durationSec,
      progress
    });
    
    // Розраховуємо фактичну швидкість читання
    const durationInMinutes = durationSec / 60;
    const actualSpeed = durationInMinutes > 0 
      ? Math.round(finalWordsRead / durationInMinutes) 
      : settingsRef.current.speed;
    
    // Зберігаємо статистику
    setStats({
      duration: durationSec,
      speed: actualSpeed,
      wordsRead: finalWordsRead,
    });
    
    // Додаткова перевірка, щоб переконатися, що статистика збережена
    console.log('Final stats:', {
      duration: durationSec,
      speed: actualSpeed,
      wordsRead: finalWordsRead,
    });
    
    // Зупиняємо таймер
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  // Очищаємо таймер при розмонтуванні
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    isPaused,
    progress,
    currentLines,
    allLines: lines,
    wordDelayMs,
    stats,
    startExercise,
    pauseExercise,
    resumeExercise,
    stopExercise,
  };
};
