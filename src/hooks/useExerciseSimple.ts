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
  // Основні стани вправи
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Поточний індекс слова та масив прихованих слів
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);
  
  // Час вправи
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Статистика
  const [stats, setStats] = useState<ExerciseStats>({
    duration: 0,
    speed: settings.speed,
    wordsRead: 0,
  });

  // Таймер для анімації
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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
    return (60 / settingsRef.current.speed) * 1000;
  };

  // Функція для приховування наступного слова
  const hideNextWord = () => {
    if (!isRunning || isPaused) return;
    
    setHiddenIndices(prev => [...prev, currentIndex]);
    setProgress(currentIndex / totalWords);
    
    if (currentIndex >= totalWords - 1) {
      // Досягли кінця тексту
      stopExercise();
      return;
    }
    
    setCurrentIndex(prev => prev + 1);
    
    // Плануємо приховування наступного слова
    timerRef.current = setTimeout(hideNextWord, getWordDelay());
  };

  // Запуск вправи
  const startExercise = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentIndex(0);
    setHiddenIndices([]);
    setProgress(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    
    // Запускаємо анімацію
    hideNextWord();
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
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Відновлення після паузи
  const resumeExercise = () => {
    setIsPaused(false);
    setStartTime(Date.now());
    
    // Відновлюємо анімацію
    hideNextWord();
  };

  // Зупинка вправи
  const stopExercise = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Розраховуємо статистику
    const totalElapsed = startTime 
      ? elapsedTime + (Date.now() - startTime)
      : elapsedTime;
    
    setStats({
      duration: Math.round(totalElapsed / 1000),
      speed: settingsRef.current.speed,
      wordsRead: currentIndex,
    });
    
    // Зупиняємо таймер
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Очищаємо таймер при розмонтуванні
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

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
