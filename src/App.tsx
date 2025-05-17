import { useState, useEffect } from 'react';
import WelcomeScreen from './components/screens/WelcomeScreen';
import ExerciseScreen from './components/screens/ExerciseScreen';
import ResultsScreen from './components/screens/ResultsScreen';
import { Settings, AppScreen, ExerciseStats } from './types';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [text, setText] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState<ExerciseStats>({
    duration: 0,
    speed: 0,
    wordsRead: 0,
  });
  const [darkMode, setDarkMode] = useState(false);
  
  // Check system preference for dark mode
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  const handleStart = (inputText: string, exerciseSettings: Settings) => {
    setText(inputText);
    setSettings(exerciseSettings);
  };

  const handleFinish = (wordsRead: number, duration: number) => {
    if (settings) {
      console.log('App: handleFinish called with', { wordsRead, duration });
      
      // Спочатку оновлюємо статистику
      setStats({
        duration,
        speed: settings.speed,
        wordsRead,
      });
      
      // Прямий перехід на екран результатів
      console.log('App: Immediate transition to results screen');
      setCurrentScreen('results');
      
      // Додатковий виклик для надійності
      setTimeout(() => {
        console.log('App: Forced transition to results screen');
        setCurrentScreen('results');
      }, 200);
    }
  };

  const handleScreenChange = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`} style={{ minHeight: '100vh' }}>
      <header className="app-header bg-card shadow-sm">
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Тренажер "Крокодил"</h1>
            </div>
            <button 
              onClick={toggleDarkMode}
              className="btn btn-secondary flex items-center justify-center"
              aria-label={darkMode ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
            >
              {darkMode ? (
                '☀️'
              ) : (
                <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor" className="text-green-600">
                  <path d="M384,160c-35.3,0-64,28.7-64,64c0,35.3,28.7,64,64,64s64-28.7,64-64C448,188.7,419.3,160,384,160z M384,256
                  c-17.6,0-32-14.4-32-32c0-17.6,14.4-32,32-32s32,14.4,32,32C416,241.6,401.6,256,384,256z"/>
                  <path d="M490.8,146.2C485.5,142,480,138,480,128c0-8.1,0-16.3,0-24.4c-0.1-8.9-7.2-16-16-16c-8.9,0-16,7.2-16,16
                  c0,8.1,0,16.3,0,24.4c0,16.7,7.2,32.3,19.7,43c1.3,1.1,2.2,2.2,2.2,4.4c0,8.3,0,16.6,0,24.9c0,1.2-0.2,1.9-1.3,2.6
                  c-15.3,9.7-31.2,18.5-47.2,27.2c-2.5,1.4-5.2,2.3-8,2.8c-7.8,1.4-15.8,1.8-23.8,1.1c-12.1-1.1-23.2-5.4-33.5-11.5
                  c-17.2-10.3-31.7-23.9-44.6-39.2c-1.9-2.3-3.8-4.5-5.9-6.5c-5.2-4.9-10.9-9.1-17.4-12.2c-13-6.2-26.6-9.5-40.8-10.5
                  c-8.9-0.6-17.9-0.3-26.9-0.3c-9.9,0-19.8,0-29.7,0c-19.8,0-39.6,0-59.4,0c-19.7,0-39.5,0-59.2,0c-9.8,0-19.7,0-29.5,0
                  c-4.8,0-9.5,0.2-14.3,0.6c-7.1,0.6-13.8,2.6-19.5,7.2C0.3,177.9,0,184.6,0,192c0,42.7,0,85.3,0,128c0,7.1,0.2,13.7,5.1,19.3
                  c4.8,5.5,11.4,7.3,18.5,7.3c14.9,0,29.8,0,44.7,0c14.7,0,29.5-0.2,44.2,0.1c6.1,0.1,12.3,0.5,18.3,1.4c10.1,1.5,19.6,4.5,28.3,9.8
                  c17.8,10.7,30.4,25.9,38.5,45c2.4,5.6,4.2,11.4,6.3,17.2c1.5,4.3,4.1,7.3,8.6,8.4c4.8,1.2,9.6,0.5,13.2-3.3
                  c3.3-3.5,3.9-7.8,2.8-12.3c-2-8.2-5.3-15.9-9.4-23.2c-1.8-3.2-3.8-6.3-5.9-9.8c1.9-0.2,3.5-0.5,5-0.5c12.2-0.2,24.5-0.3,36.7-0.5
                  c2.5,0,5-0.2,7.5-0.5c8.9-1.1,17.9-1.9,26.8-3.2c6.5-0.9,12.9-2.3,19.3-3.9c6.7-1.7,13.2-3.9,19.6-6.5c13.7-5.4,26.4-12.7,38.1-21.6
                  c23.1-17.5,41.1-39.2,54.1-65.3c2.3-4.6,4.2-9.3,6.3-14c0.5-1.2,1.2-1.7,2.5-1.7c8.3,0,16.6,0,24.9,0c2.2,0,3.3,0.9,4.4,2.2
                  c10.7,12.5,26.3,19.7,43,19.7c8.1,0,16.3,0,24.4,0c8.9-0.1,16-7.2,16-16c0-8.9-7.2-16-16-16c-8.1,0-16.3,0-24.4,0
                  c-10,0-14-5.5-18.2-10.8C494.5,155.4,494.5,149.3,490.8,146.2z M96,256c-17.7,0-32-14.3-32-32s14.3-32,32-32s32,14.3,32,32
                  S113.7,256,96,256z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>
      
      <main className="container">
        <AnimatePresence mode="wait">
          {currentScreen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WelcomeScreen 
                onStart={handleStart} 
                onScreenChange={handleScreenChange} 
              />
            </motion.div>
          )}
          
          {currentScreen === 'exercise' && settings && (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ExerciseScreen 
                text={text} 
                settings={settings} 
                onScreenChange={(screen) => {
                  console.log('App: Screen change requested to', screen);
                  setCurrentScreen(screen);
                }} 
                onFinish={(wordsRead, duration) => {
                  console.log('App: onFinish called directly');
                  handleFinish(wordsRead, duration);
                }} 
              />
            </motion.div>
          )}
          
          {currentScreen === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsScreen 
                stats={stats} 
                onScreenChange={handleScreenChange} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="app-footer bg-card shadow-sm mt-8">
        <div className="container text-center text-secondary py-4">
          <p>© 2025 Тренажер швидкісного читання "Крокодил"</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
