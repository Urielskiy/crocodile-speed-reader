import { ExerciseStats, AppScreen } from '../../types';
import { motion } from 'framer-motion';

interface ResultsScreenProps {
  stats: ExerciseStats;
  onScreenChange: (screen: AppScreen) => void;
}

const ResultsScreen = ({ stats, onScreenChange }: ResultsScreenProps) => {
  // Додаємо логування для відстеження статистики
  console.log('Results screen received stats:', stats);
  
  // Використовуємо реалістичну тривалість, якщо фактична дорівнює 0 або менше 5
  // Встановлюємо мінімальне значення 5 секунд для уникнення нереалістичних значень
  const theoreticalDuration = Math.ceil(stats.wordsRead / stats.speed * 60);
  const actualDuration = stats.duration <= 1 ? Math.max(5, theoreticalDuration) : stats.duration;
  
  console.log('Time calculation in ResultsScreen:', {
    originalDuration: stats.duration,
    theoreticalDuration,
    actualDuration,
    wordsRead: stats.wordsRead,
    speed: stats.speed
  });
  
  const formatTime = (seconds: number): string => {
    // Використовуємо розрахований час, якщо фактичний нереалістичний
    const effectiveSeconds = seconds <= 1 ? actualDuration : seconds;
    
    const minutes = Math.floor(effectiveSeconds / 60);
    const remainingSeconds = Math.floor(effectiveSeconds % 60);
    return `${minutes < 10 ? '0' + minutes : minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleNewExercise = () => {
    onScreenChange('welcome');
  };

  // Calculate reading level based on speed
  const getReadingLevel = () => {
    if (stats.speed < 150) return { level: 'Початковий', color: 'text-secondary' };
    if (stats.speed < 300) return { level: 'Середній', color: 'text-primary' };
    if (stats.speed < 500) return { level: 'Просунутий', color: 'text-accent' };
    return { level: 'Експертний', color: 'text-success' };
  };
  
  const readingLevel = getReadingLevel();
  
  // Calculate words per second
  const wordsPerSecond = stats.duration > 0 ? (stats.wordsRead / stats.duration).toFixed(1) : '0';
  
  // Calculate progress percentage for visualization
  const getSpeedPercentage = () => {
    const maxSpeed = 800; // Maximum speed on the slider
    return Math.min((stats.speed / maxSpeed) * 100, 100);
  };

  return (
    <div>
      <motion.div 
        className="bg-gradient-primary rounded-lg shadow-lg mb-8 text-white overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 justify-center mb-2">
            <svg width="36" height="36" viewBox="0 0 512 512" fill="currentColor" className="text-green-400">
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
            <h1 className="text-3xl font-bold text-center">Результати тренування</h1>
          </div>
          <p className="text-center opacity-90">Ви успішно завершили тренування швидкого читання!</p>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-card rounded-lg shadow-lg mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Статистика тренування</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Тривалість */}
            <motion.div 
              className="bg-secondary bg-opacity-5 rounded-lg p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-secondary">Тривалість</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-secondary" viewBox="0 0 16 16">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                </svg>
              </div>
              <div className="mt-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-2 shadow-sm">
                  <p className="text-3xl font-bold text-black">{formatTime(actualDuration)}</p>
                  <p className="text-xs text-gray-600 mt-1">Загальний час тренування</p>
                </div>
              </div>
            </motion.div>
            
            {/* Швидкість */}
            <motion.div 
              className="bg-primary bg-opacity-5 rounded-lg p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-primary">Швидкість</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                  <path d="M8 2a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V2.5A.5.5 0 0 1 8 2zM3.732 3.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 8a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 8zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 7.31A.91.91 0 1 0 8.85 8.569l3.434-4.297a.389.389 0 0 0-.029-.518z"/>
                  <path fillRule="evenodd" d="M6.664 15.889A8 8 0 1 1 9.336.11a8 8 0 0 1-2.672 15.78zm-4.665-4.283A11.945 11.945 0 0 1 8 10c2.186 0 4.236.585 6.001 1.606a7 7 0 1 0-12.002 0z"/>
                </svg>
              </div>
              <div className="mt-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-2 shadow-sm mb-2">
                  <p className="text-3xl font-bold text-black">{stats.speed} <span className="text-sm font-normal">слів/хв</span></p>
                  <p className="text-xs text-gray-600 mt-1">Швидкість читання</p>
                </div>
                
                <div className="mt-3">
                  <div className="bg-secondary bg-opacity-20 rounded-full h-3 w-full">
                    <div 
                      className="bg-primary rounded-full h-3" 
                      style={{ width: `${getSpeedPercentage()}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-black font-medium mt-2 text-center">
                    {readingLevel.level} рівень
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Прочитано слів */}
            <motion.div 
              className="bg-accent bg-opacity-5 rounded-lg p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-accent">Прочитано</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-accent" viewBox="0 0 16 16">
                  <path d="M5.012 1.5a.5.5 0 0 1 .538.093l7.25 7a.5.5 0 0 1 0 .814l-7.25 7a.5.5 0 0 1-.538.093.5.5 0 0 1-.312-.464V1.964a.5.5 0 0 1 .312-.464z"/>
                </svg>
              </div>
              <div className="mt-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-2 shadow-sm mb-2">
                  <p className="text-3xl font-bold text-black">{stats.wordsRead} <span className="text-sm font-normal">слів</span></p>
                  <p className="text-xs text-gray-600 mt-1">Прочитано всього</p>
                </div>
                
                <div className="bg-white bg-opacity-60 rounded-lg p-2 shadow-sm">
                  <p className="text-3xl font-bold text-black">{wordsPerSecond} <span className="text-sm font-normal">слів/сек</span></p>
                  <p className="text-xs text-gray-600 mt-1">Середня швидкість</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-card rounded-lg shadow-lg mb-8 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-4">Поради для покращення</h2>
        <ul className="list-disc pl-5 text-secondary">
          <li className="mb-2">Регулярні тренування допоможуть збільшити швидкість читання на 15-20% щомісяця.</li>
          <li className="mb-2">Спробуйте поступово збільшувати швидкість на 10 слів/хв кожного тижня.</li>
          <li>Читайте різні типи текстів для розвитку гнучкості читання.</li>
        </ul>
      </motion.div>
      
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <button
          onClick={handleNewExercise}
          className="btn btn-primary text-xl py-4 px-8"
          style={{ minWidth: '250px' }}
        >
          Почати нове тренування
        </button>
      </motion.div>
    </div>
  );
};

export default ResultsScreen;
