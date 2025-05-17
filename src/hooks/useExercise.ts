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
  
  // Індекс поточного слова, яке має зникнути
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Масив індексів слів, які вже зникли
  const [hiddenWords, setHiddenWords] = useState<number[]>([]);
  
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

  // Розбиваємо текст на слова та рядки
  const words = splitIntoWords(text);
  
  // Використовуємо useEffect для оновлення рядків при зміні налаштувань
  const [lines, setLines] = useState(() => splitIntoLines(words, settings.lineCount));
  const [currentLines, setCurrentLines] = useState(() => lines.slice(0, settings.lineCount));
  const totalWords = words.length;
  
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

  // Запускаємо вправу
  const startExercise = () => {
    // Скидаємо всі стани
    setIsRunning(true);
    setIsPaused(false);
    setProgress(0);
    setCurrentWordIndex(0);
    setHiddenWords([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    
    // Запускаємо анімацію
    hideNextWord();
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
    hideNextWord();
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
      wordsRead: currentWordIndex,
    });
    
    // Очищаємо таймер
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Функція для приховування наступного слова
  const hideNextWord = () => {
    // Якщо вправа не запущена або на паузі, не робимо нічого
    if (!isRunning || isPaused) return;
    
    // Оновлюємо прогрес
    setProgress(currentWordIndex / totalWords);
    
    // Додаємо поточний індекс до масиву прихованих слів
    setHiddenWords(prev => [...prev, currentWordIndex]);
    
    // Переходимо до наступного слова
    setCurrentWordIndex(prev => {
      const next = prev + 1;
      
      // Якщо досягли кінця, зупиняємо вправу
      if (next >= totalWords) {
        stopExercise();
        return prev;
      }
      
      return next;
    });
    
    // Плануємо приховування наступного слова через затримку
    const delay = getWordDelay();
    timerRef.current = setTimeout(hideNextWord, delay);
  };

  // Очищаємо таймер при розмонтуванні компонента
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Консоль-лог для налагодження
  useEffect(() => {
    console.log('Hidden words:', hiddenWords);
    console.log('Current word index:', currentWordIndex);
    console.log('Total words:', totalWords);
  }, [hiddenWords, currentWordIndex]);

  return {
    isRunning,
    isPaused,
    progress,
    currentLines,
    allLines: lines,
    hiddenIndices: hiddenWords, // Змінили назву змінної
    stats,
    startExercise,
    pauseExercise,
    resumeExercise,
    stopExercise,
  };
};
