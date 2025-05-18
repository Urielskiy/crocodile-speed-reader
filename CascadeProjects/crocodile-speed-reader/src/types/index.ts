export interface Settings {
  speed: number;
  lineCount: number;
  fontSize: FontSize;
}

export enum FontSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  ExtraLarge = 'extraLarge'
}

export interface ExerciseStats {
  duration: number;
  speed: number;
  wordsRead: number;
}

export type AppScreen = 'welcome' | 'exercise' | 'results';
