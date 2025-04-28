import { ExerciseStats, AppScreen } from '../../types';

interface ResultsScreenProps {
  stats: ExerciseStats;
  onScreenChange: (screen: AppScreen) => void;
}

const ResultsScreen = ({ stats, onScreenChange }: ResultsScreenProps) => {
  // Додаємо логування для відстеження статистики
  console.log('Results screen received stats:', stats);
  
  // Використовуємо реалістичну тривалість, якщо фактична дорівнює 0
  const actualDuration = stats.duration === 0 ? Math.ceil(stats.wordsRead / stats.speed * 60) : stats.duration;
  
  const formatTime = (seconds: number): string => {
    // Якщо секунди дорівнюють 0, використовуємо розрахунок на основі швидкості та кількості слів
    const effectiveSeconds = seconds === 0 ? actualDuration : seconds;
    
    const minutes = Math.floor(effectiveSeconds / 60);
    const remainingSeconds = effectiveSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleNewExercise = () => {
    onScreenChange('welcome');
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Результати вправи</h1>
      
      <div className="bg-white rounded-lg shadow-md mb-8" style={{ padding: '1.5rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-600 mb-2">Тривалість вправи</h2>
            <p className="text-3xl font-bold">{formatTime(actualDuration)}</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-600 mb-2">Швидкість (слів/хв)</h2>
            <p className="text-3xl font-bold">{stats.speed}</p>
            {stats.speed !== 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {stats.speed < 150 ? 'Початковий рівень' : 
                 stats.speed < 300 ? 'Середній рівень' : 
                 stats.speed < 500 ? 'Просунутий рівень' : 
                 'Експертний рівень'}
              </p>
            )}
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-600 mb-2">Прочитано слів</h2>
            <p className="text-3xl font-bold">{stats.wordsRead}</p>
            {stats.wordsRead > 0 && stats.duration > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {(stats.wordsRead / stats.duration).toFixed(1)} слів/сек
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={handleNewExercise}
          className="btn btn-primary text-xl py-4 px-8"
          style={{ minWidth: '250px' }}
        >
          Почати нову вправу
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
