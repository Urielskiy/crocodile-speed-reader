import { useState } from 'react';
import WelcomeScreen from './components/screens/WelcomeScreen';
import ExerciseScreen from './components/screens/ExerciseScreen';
import ResultsScreen from './components/screens/ResultsScreen';
import { Settings, AppScreen, ExerciseStats } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [text, setText] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState<ExerciseStats>({
    duration: 0,
    speed: 0,
    wordsRead: 0,
  });

  const handleStart = (inputText: string, exerciseSettings: Settings) => {
    setText(inputText);
    setSettings(exerciseSettings);
  };

  const handleFinish = (wordsRead: number, duration: number) => {
    if (settings) {
      setStats({
        duration,
        speed: settings.speed,
        wordsRead,
      });
    }
  };

  const handleScreenChange = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingTop: '2rem', paddingBottom: '2rem' }}>
      {currentScreen === 'welcome' && (
        <WelcomeScreen 
          onStart={handleStart} 
          onScreenChange={handleScreenChange} 
        />
      )}
      
      {currentScreen === 'exercise' && settings && (
        <ExerciseScreen 
          text={text} 
          settings={settings} 
          onScreenChange={handleScreenChange} 
          onFinish={handleFinish} 
        />
      )}
      
      {currentScreen === 'results' && (
        <ResultsScreen 
          stats={stats} 
          onScreenChange={handleScreenChange} 
        />
      )}
    </div>
  );
}

export default App;
