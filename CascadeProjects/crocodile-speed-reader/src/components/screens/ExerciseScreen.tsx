import { useEffect, useState } from 'react';
import { Settings, AppScreen, FontSize } from '../../types';
import { useExercise } from '../../hooks/useExerciseCss';
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

  // Перевіряємо прогрес і автоматично завершуємо вправу, коли він досягає 100%
  useEffect(() => {
    if (progress >= 0.999 && isRunning && !isPaused) { // Використовуємо 0.999 замість 1, щоб уникнути проблем з плаваючою точкою
      console.log('Exercise completed automatically, progress:', progress);
      handleStop();
    }
  }, [progress, isRunning, isPaused]);
  
  // Обробник події завершення вправи
  useEffect(() => {
    // Додаємо обробник події завершення вправи
    const handleExerciseCompleted = (event: CustomEvent) => {
      const { wordsRead, duration, speed } = event.detail;
      console.log('Exercise completed event received:', { wordsRead, duration, speed });
      
      // Використовуємо фактичний час вправи без обмежень
      // Якщо час не визначено, використовуємо реалістичне значення
      const validDuration = typeof duration === 'number' && !isNaN(duration) ? duration : 25;
      
      // Передаємо статистику і переходимо на екран результатів
      onFinish(wordsRead, validDuration);
      onScreenChange('results');
    };
    
    // Додаємо прослуховувач події
    window.addEventListener('exercise-completed', handleExerciseCompleted as EventListener);
    
    // Очищаємо прослуховувач при розмонтуванні
    return () => {
      window.removeEventListener('exercise-completed', handleExerciseCompleted as EventListener);
    };
  }, [onFinish, onScreenChange]);

  const handlePause = () => {
    pauseExercise();
  };

  const handleResume = () => {
    resumeExercise();
  };

  const handleStop = () => {
    // Зупиняємо вправу і отримуємо оновлену статистику
    stopExercise();
    
    // Додаємо невелику затримку, щоб статистика оновилась
    setTimeout(() => {
      // Отримуємо останню версію статистики
      console.log('Final exercise stats:', stats);
      
      // Використовуємо фактичні дані з статистики
      const { wordsRead, duration, speed } = stats;
      
      console.log('Sending to results screen:', { wordsRead, duration, speed });
      
      // Перевіряємо, що тривалість є числом і не NaN
      // Використовуємо фактичний час вправи без обмежень
      const validDuration = typeof duration === 'number' && !isNaN(duration) ? duration : 25; // Якщо час не визначено, використовуємо реалістичне значення
      
      // Передаємо статистику і переходимо на екран результатів
      onFinish(wordsRead, validDuration);
      onScreenChange('results');
    }, 500); // Збільшуємо затримку для надійності
  };

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
    <div className="container mx-auto">
      <div className="mb-4">
        <div className="bg-gray-200 rounded-full" style={{ height: '0.625rem', width: '100%' }}>
          <div
            className="bg-blue-600 rounded-full"
            style={{ width: `${progress * 100}%`, height: '0.625rem' }}
          ></div>
        </div>
      </div>

      <div className="mb-8 bg-white rounded-lg shadow-md" style={{ padding: '1.5rem' }}>
        {currentLines.map((line, lineIndex) => (
          <div key={lineIndex} className={`mb-4 ${getFontSizeClass()} font-medium`}>
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

      {/* Панель налаштувань, яка з'являється під час паузи */}
      {isPaused && (
        <div className="mb-8 bg-white rounded-lg shadow-md" style={{ padding: '1.5rem' }}>
          <h2 className="text-xl font-bold mb-4">Налаштування</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="speed" className="block text-lg font-medium mb-2">
                Швидкість (слів/хв): {settings.speed}
              </label>
              <input
                id="speed"
                type="range"
                min="150"
                max="800"
                step="10"
                value={settings.speed}
                onChange={(e) => setSettings(prev => ({ ...prev, speed: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <label htmlFor="font-size" className="block text-lg font-medium mb-2">
                Розмір шрифту:
              </label>
              <select
                id="font-size"
                value={settings.fontSize}
                onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value as FontSize }))}
              >
                <option value={FontSize.Small}>Малий</option>
                <option value={FontSize.Medium}>Середній</option>
                <option value={FontSize.Large}>Великий</option>
                <option value={FontSize.ExtraLarge}>Дуже великий</option>
              </select>
            </div>
            
            {/* Залишаємо тільки один рядок за замовчуванням, приховуємо вибір кількості рядків */}
            <input type="hidden" value="1" onChange={() => setSettings(prev => ({ ...prev, lineCount: 1 }))} />
          </div>
        </div>
      )}
      
      <div className="flex justify-between mb-6">
        <button 
          className="btn btn-secondary text-lg py-3 px-6"
          onClick={() => onScreenChange('welcome')}
          style={{ minWidth: '120px' }}
        >
          Назад
        </button>
        
        {!isRunning ? (
          <button 
            className="btn btn-primary text-xl py-4 px-8"
            onClick={() => startExercise()}
            style={{ minWidth: '150px' }}
          >
            Старт
          </button>
        ) : isPaused ? (
          <button 
            className="btn btn-primary text-xl py-4 px-8"
            onClick={handleResume}
            style={{ minWidth: '150px' }}
          >
            Продовжити
          </button>
        ) : (
          <button 
            className="btn btn-secondary text-xl py-4 px-8"
            onClick={handlePause}
            style={{ minWidth: '150px' }}
          >
            Пауза
          </button>
        )}
        
        <button 
          className="btn btn-secondary text-lg py-3 px-6"
          onClick={handleStop}
          style={{ minWidth: '120px', backgroundColor: '#ef4444', color: 'white' }}
        >
          Стоп
        </button>
      </div>
    </div>
  );
};

export default ExerciseScreen;
