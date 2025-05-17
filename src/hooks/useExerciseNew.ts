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
  hiddenIndices: number[];
  stats: ExerciseStats;
  startExercise: () => void;
  pauseExercise: () => void;
  resumeExercise: () => void;
  stopExercise: () => void;
}

export const useExercise = ({ text, settings }: UseExerciseProps): UseExerciseReturn => {
  // Зберігаємо налаштування в ref, щоб мати доступ до актуальних значень
  const settingsRef = useRef(settings);
  
  // Оновлюємо ref при зміні налаштувань
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  
  // Основні стани вправи
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Масив індексів слів, які вже зникли
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);
  
  // Час початку вправи та загальний час
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Статистика вправи
  const [stats, setStats] = useState<ExerciseStats>({
    duration: 0,
    speed: settings.speed,
    wordsRead: 0,
  });

  // Таймер для анімації
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Поточний індекс слова для анімації
  const currentIndexRef = useRef(0);

  // Розбиваємо текст на слова та рядки
  const words = splitIntoWords(text);
  const totalWords = words.length;
  
  // Використовуємо useEffect для оновлення рядків при зміні налаштувань
  const [lines, setLines] = useState(() => splitIntoLines(words, settings.lineCount));
  const [currentLines, setCurrentLines] = useState(() => lines.slice(0, settings.lineCount));
  
  // Оновлюємо рядки при зміні налаштувань
  useEffect(() => {
    const newLines = splitIntoLines(words, settings.lineCount);
    setLines(newLines);
    setCurrentLines(newLines.slice(0, settings.lineCount));
  }, [words, settings.lineCount]);

  // Розраховуємо затримку між словами на основі швидкості
  const getWordDelay = () => {
    // Конвертуємо слів/хв у мс/слово
    return (60 / settingsRef.current.speed) * 1000;
  };

  // Функція для анімації слів
  const animateWords = () => {
    if (!isRunning || isPaused) return;
    
    // Отримуємо поточний індекс
    const currentIndex = currentIndexRef.current;
    
    // Якщо досягли кінця тексту, зупиняємо вправу
    if (currentIndex >= totalWords) {
      stopExercise();
      return;
    }
    
    // Оновлюємо прогрес
    setProgress(currentIndex / totalWords);
    
    // Додаємо поточний індекс до масиву прихованих слів
    setHiddenIndices(prev => {
      // Перевіряємо, чи індекс вже є в масиві
      if (!prev.includes(currentIndex)) {
        return [...prev, currentIndex];
      }
      return prev;
    });
    
    // Збільшуємо індекс для наступної ітерації
    currentIndexRef.current = currentIndex + 1;
    
    // Плануємо наступну анімацію
    const delay = getWordDelay();
    timerRef.current = setTimeout(animateWords, delay);
  };

  // Запускаємо вправу
  const startExercise = () => {
    // Скидаємо всі стани
    setIsRunning(true);
    setIsPaused(false);
    setProgress(0);
    setHiddenIndices([]);
    currentIndexRef.current = 0;
    setStartTime(Date.now());
    setElapsedTime(0);
    
    // Запускаємо анімацію
    animateWords();
  };

  // Ставимо вправу на паузу
  const pauseExercise = () => {
    setIsPaused(true);
    
    // Зберігаємо час, що пройшов
    if (startTime) {
      setElapsedTime(prev => prev + (Date.now() - startTime));
      setStartTime(null);
    }
    
    // Очищаємо таймер
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Відновлюємо вправу після паузи
  const resumeExercise = () => {
    setIsPaused(false);
    setStartTime(Date.now());
    
    // Відновлюємо анімацію
    animateWords();
  };

  // Зупиняємо вправу
  const stopExercise = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Розраховуємо фінальну статистику
    const totalElapsed = startTime 
      ? elapsedTime + (Date.now() - startTime)
      : elapsedTime;
    
    setStats({
      duration: Math.round(totalElapsed / 1000),
      speed: settingsRef.current.speed,
      wordsRead: currentIndexRef.current,
    });
    
    // Очищаємо таймер
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Очищаємо таймер при розмонтуванні компонента
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Консоль-лог для налагодження - закоментовано, щоб уникнути зайвих оновлень
  /*
  useEffect(() => {
    console.log('Hidden indices:', hiddenIndices);
    console.log('Current index:', currentIndexRef.current);
    console.log('Total words:', totalWords);
  }, [hiddenIndices, totalWords]);
  */

  return {
    isRunning,
    isPaused,
    progress,
    currentLines,
    allLines: lines,
    hiddenIndices,
    stats,
    startExercise,
    pauseExercise,
    resumeExercise,
    stopExercise,
  };
};
