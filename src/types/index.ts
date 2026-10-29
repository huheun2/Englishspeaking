export type CharacterId = 'lucy' | 'oliver';

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  nameKo: string;
  role: string;
  country: string;
  flag: string;
  accent: 'en-US' | 'en-GB';
  color: string;
  description: string;
}

export type MicState = 'ready' | 'listening' | 'done';

export type ScreenId = 'start' | 'practice' | 'result';

export interface TravelGoal {
  placeKo: string;
  actionKo: string;
  placeEn: string;
  actionEn: string;
  secondaryPlaceEn: string;
  secondaryReasonEn: string;
}

export interface DialogueTurn {
  turnNumber: number;
  partnerPrompt: string;
  partnerPromptKo: string;
  studentTargetSentence: string;
  studentTargetSentenceKo: string;
  keywords: string[];
  pronunciationFocus: string[]; // e.g. ["travel", "world"]
}

export type CharacterExpression =
  | 'smiling'
  | 'happy'
  | 'curious'
  | 'excited'
  | 'encouraging'
  | 'clapping'
  | 'celebrating'
  | 'puzzled'
  | 'listening'
  | 'idle';

export interface SpeechEvaluation {
  status: 'success' | 'near_success' | 'try_again' | 'no_speech';
  feedbackEn: string;
  feedbackKo: string;
  characterExpression: CharacterExpression;
  matchedWords: string[];
  missingWords: string[];
  pronunciationTip: string;
  starsAwarded: number;
  guidanceStep: 'success' | 'fill_in_word' | 'recast' | 'elicitation' | 'chunking';
}

export interface TurnRecord {
  turnNumber: number;
  targetSentence: string;
  spokenText: string;
  evaluation: SpeechEvaluation;
  attemptCount: number;
  starsEarned: number;
}
