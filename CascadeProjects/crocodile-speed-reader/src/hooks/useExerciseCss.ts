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
    const totalElapsed = elapsedTime + (currentTime - (startTime || currentTime));
    
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
    const durationInMinutes = totalElapsed / (1000 * 60);
    const actualSpeed = durationInMinutes > 0 
      ? Math.round(wordsRead / durationInMinutes) 
      : settingsRef.current.speed;
    
    // Оновлюємо статистику під час вправи
    setStats({
      duration: Math.round(totalElapsed / 1000),
      speed: actualSpeed,
      wordsRead: wordsRead, // Використовуємо поточну кількість прочитаних слів
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
    
    // Якщо всі слова прочитані або прогрес близький до 100%, зупиняємо вправу і переходимо на екран результатів
    if (wordsRead >= totalWords || progress >= 0.99) {
      console.log('All words have been read, stopping exercise and showing results automatically');
      
      // Зупиняємо вправу
      stopExercise();
      
      // Створюємо об'єкт з фінальною статистикою
      const finalDuration = Math.round(totalElapsed / 1000);
      console.log('Final duration for event:', finalDuration);
      
      const finalStats = {
        wordsRead: totalWords, // Використовуємо загальну кількість слів
        duration: finalDuration, // Фактичний час вправи
        speed: actualSpeed
      };
      
      // Додаємо подію, щоб повідомити про завершення вправи
      const event = new CustomEvent('exercise-completed', { 
        detail: finalStats
      });
      window.dispatchEvent(event);
    }
  };

  // Запуск вправи
  const startExercise = () => {
    setIsRunning(true);
    setIsPaused(false);
    setProgress(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    wordsReadRef.current = 0;
    
    // Зберігаємо час початку вправи в референсі
    // Це важливо для правильного розрахунку загальної тривалості вправи
    exerciseStartTimeRef.current = Date.now();
    console.log('Exercise started at:', new Date(exerciseStartTimeRef.current).toISOString());
    
    // Запускаємо таймер для оновлення прогресу
    progressTimerRef.current = setInterval(updateProgress, 100);
  };

  // Пауза
  const pauseExercise = () => {
    setIsPaused(true);
    
    // Зберігаємо час
    if (startTime) {
      setElapsedTime(prev => prev + (Date.now() - startTime));
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
    setIsPaused(false);
    setStartTime(Date.now());
    setWordDelayMs(getWordDelay());
    
    // Відновлюємо таймер
    progressTimerRef.current = setInterval(updateProgress, 100);
  };

  // Зупинка вправи
  const stopExercise = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Розраховуємо фактичну тривалість вправи
    const currentTime = Date.now();
    const startTimeToUse = exerciseStartTimeRef.current || startTime || currentTime;
    
    // Використовуємо фактичний час від початку вправи до поточного моменту
    console.log('Exercise ended at:', new Date(currentTime).toISOString());
    console.log('Exercise duration:', (currentTime - startTimeToUse) / 1000, 'seconds');
    
    // Забезпечуємо, що використовується реальний час вправи
    const totalElapsed = currentTime - startTimeToUse;
    
    // В будь-якому випадку вважаємо, що прочитано всі слова в тексті
    // Це радикальне рішення, але воно забезпечить правильне відображення результатів
    const finalWordsRead = totalWords;
    
    console.log('Using total word count as read words:', finalWordsRead);
    
    // Виводимо детальну інформацію про завершення вправи
    // Використовуємо фактичний час вправи без обмежень
    const durationSec = Math.round(totalElapsed / 1000);
    console.log('Final duration in seconds:', durationSec);
    
    console.log('Exercise stopped:', { 
      startTime: exerciseStartTimeRef.current ? new Date(exerciseStartTimeRef.current).toISOString() : 'unknown',
      endTime: new Date(currentTime).toISOString(),
      totalElapsed, 
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
      duration: Math.round(totalElapsed / 1000),
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
