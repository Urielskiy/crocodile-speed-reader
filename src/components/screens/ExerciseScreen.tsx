import { useEffect, useState } from 'react';
import { Settings, AppScreen, FontSize } from '../../types';
import { useExercise } from '../../hooks/useExerciseCss';
import { motion } from 'framer-motion';
import './exercise.css';

interface ExerciseScreenProps {
  text: string;
  settings: Settings;
  onScreenChange: (screen: AppScreen) => void;
  onFinish: (wordsRead: number, duration: number) => void;
}

const ExerciseScreen = ({ text, settings: initialSettings, onScreenChange, onFinish }: ExerciseScreenProps) => {
  // Локальна копія налаштувань, яку можна змінювати під час паузи
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const {
    isRunning,
    isPaused,
    progress,
    currentLines,
    wordDelayMs,
    stats,
    startExercise,
    pauseExercise,
    resumeExercise,
    stopExercise,
  } = useExercise({ text, settings });

  // Не запускаємо вправу автоматично при монтуванні компонента
  useEffect(() => {
    // Очищення при розмонтуванні
    return () => {
      stopExercise();
    };
  }, []);

  // Перевіряємо прогрес і зупиняємо таймер, коли він досягає 100%
  useEffect(() => {
    // Перевіряємо, чи досягнуто кінець вправи - тільки коли прогрес рівно 1 (100%)
    if (progress >= 0.999 && isRunning && !isPaused) {
      console.log('Exercise completed, progress:', progress);
      
      // Зупиняємо вправу одразу - це зупинить таймер і збереже час
      // Але не переходить автоматично на екран результатів
      // Чекаємо натискання кнопки Результати
      stopExercise();
      
      // Додаємо невелику затримку для анімації зникнення останніх слів
      setTimeout(() => {
        console.log('Exercise completed, waiting for user to click Results button');
      }, 500);
    }
  }, [progress, isRunning, isPaused, stopExercise]);
  
  // Додатковий ефект для відстеження зміни статистики
  useEffect(() => {
    // Якщо вправа завершена і статистика оновлена
    // Також перевіряємо, що прогрес досяг 100%
    if (!isRunning && stats.wordsRead > 0 && progress >= 0.999) {
      console.log('Exercise completed with stats:', stats);
      
      // Отримуємо кількість слів в тексті
      const wordCount = text.split(/\s+/).filter(word => word.trim()).length;
      
      // Перехід на екран результатів
      console.log('ExerciseScreen: Transition after stats update');
      onFinish(wordCount, stats.duration);
      onScreenChange('results');
      
      // Додатковий виклик через невелику затримку
      setTimeout(() => {
        console.log('ExerciseScreen: Additional transition after stats');
        onFinish(wordCount, stats.duration);
        onScreenChange('results');
      }, 300);
    }
  }, [stats, isRunning, progress, text, onFinish, onScreenChange]);

  const handlePause = () => {
    pauseExercise();
  };

  const handleResume = () => {
    resumeExercise();
  };

  // Функція handleStop більше не потрібна, оскільки ми використовуємо прямий перехід на екран результатів

  // Get font size class based on settings
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case FontSize.Small:
        return 'text-base';
      case FontSize.Medium:
        return 'text-lg';
      case FontSize.Large:
        return 'text-xl';
      case FontSize.ExtraLarge:
        return 'text-2xl';
      default:
        return 'text-lg';
    }
  };

  return (
    <div>

      <motion.div 
        className="mb-4 bg-card rounded-lg shadow-lg"
        style={{ padding: '1rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="mb-4">
          {/* Removed duplicate title */}
          
          <div className="w-full space-y-3 px-4 py-2">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-3 shadow-sm flex items-center transition-all hover:shadow-md">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
              </div>
              <p className="text-sm">Натисніть кнопку <strong className="text-blue-700">Старт</strong>, щоб почати тренування.</p>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 rounded-lg p-3 shadow-sm flex items-center transition-all hover:shadow-md">
              <div className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                </svg>
              </div>
              <p className="text-sm">Кнопку <strong className="text-amber-700">Пауза</strong> щоб змінити налаштування і продовжити.</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-3 shadow-sm flex items-center transition-all hover:shadow-md">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                </svg>
              </div>
              <p className="text-sm">Кнопку <strong className="text-green-700">Результати</strong> щоб побачити результати тренування.</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="mb-8 bg-card rounded-lg shadow-lg"
        style={{ padding: '1.5rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="exercise-content" style={{ minHeight: '200px' }}>
          {currentLines.map((line, lineIndex) => (
            <div key={lineIndex} className={`mb-4 ${getFontSizeClass()} font-medium text-center`}>
              {line.map((word, wordIndex) => {
                // Для одночасного зникнення слів у вертикальних колонках
                // Затримка залежить тільки від позиції слова в рядку (тобто від колонки)
                
                // Розраховуємо затримку для CSS-анімації - залежить тільки від позиції слова в рядку
                const animationDelay = `${wordIndex * wordDelayMs}ms`;
                
                return (
                  <span
                    key={wordIndex}
                    className={isRunning && !isPaused ? 'word-animation' : ''}
                    style={{
                      display: 'inline-block', 
                      margin: '0 0.25rem',
                      opacity: isPaused ? 1 : undefined,
                      animationDelay: animationDelay,
                      animationPlayState: isRunning && !isPaused ? 'running' : 'paused',
                      animationDuration: '0.5s',
                      animationFillMode: 'forwards'
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Панель налаштувань, яка з'являється під час паузи */}
      {isPaused && (
        <motion.div 
          className="mb-8 bg-card rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 bg-gradient-primary text-white">
            <h2 className="text-xl font-bold">Налаштування тренування</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div className="settings-block bg-card">
                <label htmlFor="speed" className="settings-label">
                  Швидкість читання: <span className="settings-value">{settings.speed}</span> слів/хв
                </label>
                <div className="mb-3 text-secondary text-sm">
                  Визначає, скільки слів ви будете читати за хвилину.
                </div>
                
                {/* Візуальні позначки для повзунка */}
                <div className="slider-tick-marks">
                  {[150, 250, 350, 450, 550, 650, 750].map((tick) => (
                    <div key={tick} className="slider-tick"></div>
                  ))}
                </div>
                
                <input
                  id="speed"
                  type="range"
                  min="150"
                  max="800"
                  step="10"
                  value={settings.speed}
                  onChange={(e) => setSettings(prev => ({ ...prev, speed: parseInt(e.target.value) }))}
                  style={{
                    backgroundSize: `${((settings.speed - 150) / (800 - 150)) * 100}% 100%`
                  }}
                />
                
                <div className="slider-labels">
                  <span>Повільно (150)</span>
                  <span>Середньо (400)</span>
                  <span>Швидко (800)</span>
                </div>
              </div>
              
              <div className="settings-block bg-card">
                <label htmlFor="font-size" className="settings-label">
                  Розмір шрифту
                </label>
                <div className="mb-3 text-secondary text-sm">
                  Оберіть комфортний розмір шрифту для читання.
                </div>
                
                <div className="relative">
                  <select
                    id="font-size"
                    value={settings.fontSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value as FontSize }))}
                    className="mt-2 py-3 pl-4 pr-10 appearance-none bg-card border border-secondary border-opacity-20 rounded-lg shadow-sm w-full"
                  >
                    <option value={FontSize.Small}>Малий</option>
                    <option value={FontSize.Medium}>Середній</option>
                    <option value={FontSize.Large}>Великий</option>
                    <option value={FontSize.ExtraLarge}>Дуже великий</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Залишаємо тільки один рядок за замовчуванням, приховуємо вибір кількості рядків */}
              <input type="hidden" value="1" onChange={() => setSettings(prev => ({ ...prev, lineCount: 1 }))} />
            </div>
            
            <div className="text-center mt-4">
              <p className="text-secondary text-sm">Ви можете змінити налаштування під час паузи і продовжити тренування</p>
            </div>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className="flex justify-between mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <button 
          className="btn btn-secondary"
          onClick={() => onScreenChange('welcome')}
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Назад
          </span>
        </button>
        
        {!isRunning ? (
          <div className="flex gap-2">
            <button 
              className="btn btn-primary text-lg py-3 px-6"
              onClick={() => startExercise()}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
                Старт
              </span>
            </button>
            
            <button 
              className="btn btn-success text-lg py-3 px-6"
              onClick={() => {
                // Прямий перехід на екран результатів
                const wordCount = text.split(/\s+/).filter(word => word.trim()).length;
                
                // Використовуємо збережену статистику з хука
                console.log('Results button clicked, using saved stats:', stats);
                onFinish(stats.wordsRead > 0 ? stats.wordsRead : wordCount, stats.duration);
                onScreenChange('results');
              }}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                </svg>
                Результати
              </span>
            </button>
          </div>
        ) : isPaused ? (
          <div className="flex gap-2">
            <button 
              className="btn btn-primary text-lg py-3 px-6"
              onClick={handleResume}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
                Продовжити
              </span>
            </button>
            
            <button 
              className="btn btn-success text-lg py-3 px-6"
              onClick={() => {
                // Прямий перехід на екран результатів
                const wordCount = text.split(/\s+/).filter(word => word.trim()).length;
                
                // Використовуємо збережену статистику з хука
                console.log('Results button clicked (paused), using saved stats:', stats);
                onFinish(stats.wordsRead > 0 ? stats.wordsRead : wordCount, stats.duration);
                onScreenChange('results');
              }}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                </svg>
                Результати
              </span>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button 
              className="btn btn-secondary text-lg py-3 px-6"
              onClick={handlePause}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                </svg>
                Пауза
              </span>
            </button>
            
            <button 
              className="btn btn-success text-lg py-3 px-6"
              onClick={() => {
                // Зупиняємо вправу
                stopExercise();
                
                // Прямий перехід на екран результатів
                const wordCount = text.split(/\s+/).filter(word => word.trim()).length;
                
                // Використовуємо збережену статистику з хука
                // Чекаємо невелику затримку, щоб stopExercise завершив обчислення статистики
                setTimeout(() => {
                  console.log('Results button clicked (running), using saved stats:', stats);
                  onFinish(stats.wordsRead > 0 ? stats.wordsRead : wordCount, stats.duration);
                  onScreenChange('results');
                }, 100);
              }}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                </svg>
                Результати
              </span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ExerciseScreen;
