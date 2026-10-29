import React, { useState } from 'react';
import { CharacterId, DialogueTurn, ScreenId, TravelGoal, TurnRecord } from './types';
import { StartScreen } from './components/StartScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { ResultScreen } from './components/ResultScreen';
import { createDialogueTurns } from './utils/dialogue';
import { CHARACTERS_DATA } from './components/CharacterAvatar';

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('start');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>('lucy');

  const [travelGoal, setTravelGoal] = useState<TravelGoal>({
    placeKo: '파리',
    actionKo: '에펠탑 보기',
    placeEn: 'Paris',
    actionEn: 'see the Eiffel Tower',
    secondaryPlaceEn: 'London',
    secondaryReasonEn: 'it has amazing castles and double-decker buses',
  });

  const [dialogueTurns, setDialogueTurns] = useState<DialogueTurn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [records, setRecords] = useState<TurnRecord[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  // Start Practice from Screen 1
  const handleStartPractice = async (goal: TravelGoal) => {
    setIsTranslating(true);
    let updatedGoal = { ...goal };

    try {
      // Call translate-dream endpoint
      const res = await fetch('/api/translate-dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeKo: goal.placeKo,
          actionKo: goal.actionKo,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updatedGoal = {
          ...updatedGoal,
          placeEn: data.placeEn || 'Paris',
          actionEn: data.actionEn || 'see a new world',
          secondaryPlaceEn: data.secondaryPlaceEn || 'London',
          secondaryReasonEn: data.secondaryReasonEn || 'it looks fun and beautiful',
        };
      }
    } catch (e) {
      console.warn('Translation fetch failed, using fallback:', e);
      // Fast fallback dictionary
      const fallbackMap: Record<string, string> = {
        파리: 'Paris',
        런던: 'London',
        하와이: 'Hawaii',
        뉴욕: 'New York',
        도쿄: 'Tokyo',
        우주: 'Space',
      };
      updatedGoal.placeEn = fallbackMap[goal.placeKo.trim()] || goal.placeKo.trim() || 'Paris';
      updatedGoal.actionEn = goal.actionKo.trim() || 'see the Eiffel Tower';
    } finally {
      setIsTranslating(false);
    }

    setTravelGoal(updatedGoal);
    const turns = createDialogueTurns(updatedGoal);
    setDialogueTurns(turns);
    setCurrentTurnIndex(0);
    setRecords([]);
    setScreen('practice');
  };

  // Turn completed on Screen 2
  const handleTurnComplete = (record: TurnRecord) => {
    const nextRecords = [...records, record];
    setRecords(nextRecords);

    if (currentTurnIndex + 1 < dialogueTurns.length) {
      setCurrentTurnIndex((prev) => prev + 1);
    } else {
      // All 5 turns complete -> Move to Result Screen
      setScreen('result');
    }
  };

  // Skip turn on Screen 2
  const handleSkipTurn = () => {
    const currentTurn = dialogueTurns[currentTurnIndex];
    const skippedRecord: TurnRecord = {
      turnNumber: currentTurn.turnNumber,
      targetSentence: currentTurn.studentTargetSentence,
      spokenText: '(건너뜀)',
      attemptCount: 1,
      evaluation: {
        status: 'try_again',
        feedbackEn: 'Good try! Let’s keep going!',
        feedbackKo: '괜찮아요! 다음 문장으로 힘차게 가봐요!',
        characterExpression: 'encouraging',
        matchedWords: [],
        missingWords: currentTurn.keywords,
        pronunciationTip: '다음 문장에서 더 큰 목소리로 도전해 봐요!',
        starsAwarded: 5, // Section 6: Star rules reward completion!
        guidanceStep: 'recast',
      },
      starsEarned: 5,
    };

    handleTurnComplete(skippedRecord);
  };

  // Restart same travel destination
  const handleRestart = () => {
    const turns = createDialogueTurns(travelGoal);
    setDialogueTurns(turns);
    setCurrentTurnIndex(0);
    setRecords([]);
    setScreen('practice');
  };

  // Choose new travel destination
  const handleNewDream = () => {
    setScreen('start');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50/60 to-purple-100 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            onClick={handleNewDream}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">✈️</span>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Where you want to go<span className="text-blue-600">😎</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500 ml-1">
                초등 영어 말하기 대화 앱
              </span>
            </div>
          </div>

          {/* Quick info & active character badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
              <span>친구:</span>
              <span className="text-slate-800">
                {CHARACTERS_DATA[selectedCharacter].flag} {CHARACTERS_DATA[selectedCharacter].name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        {screen === 'start' && (
          <StartScreen
            initialGoal={travelGoal}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={setSelectedCharacter}
            onStartPractice={handleStartPractice}
            isTranslating={isTranslating}
          />
        )}

        {screen === 'practice' && dialogueTurns[currentTurnIndex] && (
          <PracticeScreen
            key={currentTurnIndex}
            turn={dialogueTurns[currentTurnIndex]}
            totalTurns={dialogueTurns.length}
            characterId={selectedCharacter}
            onTurnComplete={handleTurnComplete}
            onSkipTurn={handleSkipTurn}
            onGoToStart={handleNewDream}
          />
        )}

        {screen === 'result' && (
          <ResultScreen
            records={records}
            travelGoal={travelGoal}
            characterId={selectedCharacter}
            onRestart={handleRestart}
            onNewDream={handleNewDream}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
        <p>
          Where you want to go😎 • 허은 (Student ID: 2024315682) • CEFR A2 Elementary English Speaking Practice
        </p>
      </footer>
    </div>
  );
}
