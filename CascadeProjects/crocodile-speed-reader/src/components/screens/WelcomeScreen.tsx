import { useState } from 'react';
import { Settings, FontSize, AppScreen } from '../../types';

interface WelcomeScreenProps {
  onStart: (text: string, settings: Settings) => void;
  onScreenChange: (screen: AppScreen) => void;
}

const WelcomeScreen = ({ onStart, onScreenChange }: WelcomeScreenProps) => {
  const [text, setText] = useState('');
  const [settings, setSettings] = useState<Settings>({
    speed: 200,
    lineCount: 1,
    fontSize: FontSize.Medium,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      speed: parseInt(e.target.value),
    }));
  };

  // Функція для зміни налаштувань видалена, оскільки ми залишили тільки один рядок за замовчуванням

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      fontSize: e.target.value as FontSize,
    }));
  };

  const handleStart = () => {
    if (text.trim().length > 0) {
      onStart(text, settings);
      onScreenChange('exercise');
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Вправа "Крокодил"</h1>
      
      <div className="mb-6">
        <label htmlFor="text-input" className="block text-lg font-medium mb-2">
          Вставте текст для тренування:
        </label>
        <textarea
          id="text-input"
          className="mb-4"
          style={{ height: '12rem' }}
          value={text}
          onChange={handleTextChange}
          placeholder="Вставте або введіть текст тут..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 mb-6">
        <div className="mb-4">
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
            onChange={handleSpeedChange}
            style={{ width: '100%' }}
          />
        </div>
        
        {/* Залишаємо тільки один рядок за замовчуванням, приховуємо вибір кількості рядків */}
        <input type="hidden" value="1" onChange={() => setSettings(prev => ({ ...prev, lineCount: 1 }))} />
        
        <div className="mb-4">
          <label htmlFor="font-size" className="block text-lg font-medium mb-2">
            Розмір шрифту:
          </label>
          <select
            id="font-size"
            value={settings.fontSize}
            onChange={handleFontSizeChange}
          >
            <option value={FontSize.Small}>Малий</option>
            <option value={FontSize.Medium}>Середній</option>
            <option value={FontSize.Large}>Великий</option>
            <option value={FontSize.ExtraLarge}>Дуже великий</option>
          </select>
        </div>
      </div>
      
      <div className="text-center">
        <button 
          className="btn btn-primary text-xl py-4 px-8 w-full"
          onClick={handleStart}
          style={{ maxWidth: '400px', margin: '0 auto' }}
        >
          Перейти до тренування
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
