import { useState, useRef, useEffect } from 'react';
import { Settings, FontSize, AppScreen } from '../../types';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStart: (text: string, settings: Settings) => void;
  onScreenChange: (screen: AppScreen) => void;
}

const WelcomeScreen = ({ onStart, onScreenChange }: WelcomeScreenProps) => {
  const [text, setText] = useState('');
  const [settings, setSettings] = useState<Settings>({
    speed: 150, // Changed from 200 to 150 as per the Eye Center trainer
    lineCount: 1,
    fontSize: FontSize.Medium,
  });
  
  // Референси для кастомного повзунка
  const sliderRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  // Не потрібно в новому дизайні
  // Функція для визначення класу розміру шрифту видалена
  
  // Функція для обробки кастомного повзунка
  const updateSliderPosition = (clientX: number) => {
    if (!sliderRef.current || !handleRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const position = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, position / rect.width));
    
    // Перетворення відсотка в значення швидкості
    const minSpeed = 150;
    const maxSpeed = 800;
    const speed = Math.round(minSpeed + percentage * (maxSpeed - minSpeed));
    
    // Округлення до кроку 10
    const roundedSpeed = Math.round(speed / 10) * 10;
    
    setSettings(prev => ({ ...prev, speed: roundedSpeed }));
  };
  
  // Обробники подій для кастомного повзунка
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    updateSliderPosition(e.clientX);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    updateSliderPosition(e.clientX);
  };
  
  const handleMouseUp = () => {
    isDragging.current = false;
  };
  
  // Додаємо обробники подій при монтуванні компонента
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Функція handleSpeedChange більше не потрібна, оскільки ми використовуємо кастомний повзунок
  // з функцією updateSliderPosition

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
    <div>
      <motion.div 
        className="bg-card rounded-lg shadow-lg mb-8 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg width="36" height="36" viewBox="0 0 512 512" fill="currentColor" className="text-green-600">
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
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4">Як це працює:</h3>
            
            <div className="mb-6 space-y-3">
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
                <p className="flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 font-bold">1</span>
                  <span><strong>Вставте текст</strong> для тренування у поле нижче.</span>
                </p>
              </div>
              
              <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
                <p className="flex items-center">
                  <span className="bg-purple-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 font-bold">2</span>
                  <span><strong>Налаштуйте швидкість</strong> читання та розмір шрифту за вашими потребами.</span>
                </p>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
                <p className="flex items-center">
                  <span className="bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 font-bold">3</span>
                  <span><strong>Натисніть кнопку "Почати тренування"</strong> і слідкуйте за словами, що з'являються та зникають.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-card rounded-lg shadow-lg mb-8 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <textarea
          id="text-input"
          className="mb-4 shadow-sm"
          style={{ height: '12rem', width: '100%' }}
          value={text}
          onChange={handleTextChange}
          placeholder="Вставте або введіть текст тут..."
        />
      </motion.div>
      
      <motion.div 
        className="settings-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="settings-header">
          <span className="settings-header-icon">⚙️</span>
          <h3 className="settings-header-text">Налаштування</h3>
        </div>
        
        <p className="settings-description">Налаштуйте параметри читання для кращого досвіду.</p>
        
        <div className="settings-grid">
          {/* Швидкість читання */}
          <div className="settings-item">
            <div className="settings-label">
              <span>Швидкість читання</span>
              <span className="settings-value">{settings.speed} слів/хв</span>
            </div>
            
            <div className="slider-container" ref={sliderRef} onClick={(e) => updateSliderPosition(e.clientX)}>
              <div className="slider-track"></div>
              <div 
                className="slider-fill" 
                style={{ width: `${((settings.speed - 150) / (800 - 150)) * 100}%` }}
              ></div>
              <div 
                className="slider-handle" 
                ref={handleRef} 
                onMouseDown={handleMouseDown}
                style={{ left: `${((settings.speed - 150) / (800 - 150)) * 100}%` }}
              ></div>
            </div>
            
            <p className="settings-description-small">Збільшуйте швидкість для тренування швидкого читання</p>
          </div>
          
          {/* Розмір шрифту */}
          <div className="settings-item">
            <div className="settings-label">
              <span>Розмір шрифту</span>
            </div>
            
            <div className="select-container">
              <select 
                className="custom-select" 
                value={settings.fontSize}
                onChange={handleFontSizeChange}
              >
                <option value={FontSize.Small}>Малий</option>
                <option value={FontSize.Medium}>Середній</option>
                <option value={FontSize.Large}>Великий</option>
                <option value={FontSize.ExtraLarge}>Дуже великий</option>
              </select>
              <div className="select-arrow">▼</div>
            </div>
            
            <p className="settings-description-small">Оберіть комфортний розмір шрифту для читання</p>
          </div>
        </div>
        
        {/* Залишаємо тільки один рядок за замовчуванням, приховуємо вибір кількості рядків */}
        <input type="hidden" value="1" onChange={() => setSettings(prev => ({ ...prev, lineCount: 1 }))} />
      </motion.div>
      
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button 
          className="start-button"
          onClick={handleStart}
          disabled={text.trim().length === 0}
        >
          Почати Читання
        </button>
        {text.trim().length === 0 && (
          <p className="mt-2 text-danger text-sm">Спочатку введіть текст для тренування</p>
        )}
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
