import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  RotateCcw,
  ArrowRight,
  FastForward,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  Clock,
} from 'lucide-react';
import {
  CharacterId,
  CharacterExpression,
  DialogueTurn,
  MicState,
  SpeechEvaluation,
  TurnRecord,
} from '../types';
import { CharacterAvatar, CHARACTERS_DATA } from './CharacterAvatar';
import { MicButton } from './MicButton';
import { StarRating } from './StarRating';
import {
  speakSentence,
  stopSpeaking,
  SpeechRecognizerController,
  isSpeechRecognitionSupported,
} from '../utils/audio';

interface PracticeScreenProps {
  turn: DialogueTurn;
  totalTurns: number;
  characterId: CharacterId;
  onTurnComplete: (record: TurnRecord) => void;
  onSkipTurn: () => void;
  onGoToStart: () => void;
}

function getTurnSpeakingEmotion(turnNumber: number): CharacterExpression {
  switch (turnNumber) {
    case 1:
      return 'curious'; // "Where do you want to travel to?"
    case 2:
      return 'excited'; // "Why do you want to go there?"
    case 3:
      return 'curious'; // "What do you want to see there?"
    case 4:
      return 'excited'; // "Is there another country you want to travel to?"
    case 5:
      return 'curious'; // "Why is that?"
    default:
      return 'smiling';
  }
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  turn,
  totalTurns,
  characterId,
  onTurnComplete,
  onSkipTurn,
  onGoToStart,
}) => {
  const character = CHARACTERS_DATA[characterId];

  // Speech and Mic states
  const [micState, setMicState] = useState<MicState>('ready');
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<SpeechEvaluation | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [showKoMeaning, setShowKoMeaning] = useState(true);
  const [showQuestionKo, setShowQuestionKo] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Character emotional state
  const [characterExpression, setCharacterExpression] = useState<CharacterExpression>(
    getTurnSpeakingEmotion(turn.turnNumber)
  );

  // Recognizer ref
  const recognizerRef = useRef<SpeechRecognizerController | null>(null);

  // Initialize speech recognition controller on mount
  useEffect(() => {
    recognizerRef.current = new SpeechRecognizerController();
    recognizerRef.current.setLanguage(character.accent);

    return () => {
      recognizerRef.current?.stopListening();
      stopSpeaking();
    };
  }, [character.accent]);

  // Read partner question automatically on turn change or when requested
  useEffect(() => {
    // Reset state for new turn
    setMicState('ready');
    setSpokenTranscript('');
    setEvaluation(null);
    setAttemptCount(1);
    setErrorMessage(null);
    const initialEmotion = getTurnSpeakingEmotion(turn.turnNumber);
    setCharacterExpression(initialEmotion);

    // Auto-read partner question with kind voice
    const timer = setTimeout(() => {
      handlePlayPartnerQuestion();
    }, 400);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [turn.turnNumber]);

  // Read partner question aloud with emotional voice & avatar expression
  const handlePlayPartnerQuestion = () => {
    stopSpeaking();
    recognizerRef.current?.stopListening();
    setMicState('ready');
    const questionEmotion = getTurnSpeakingEmotion(turn.turnNumber);
    setCharacterExpression(questionEmotion);

    speakSentence({
      text: turn.partnerPrompt,
      lang: character.accent,
      rate: isSlowMode ? 0.7 : 0.9,
      onStart: () => setIsModelSpeaking(true),
      onEnd: () => {
        setIsModelSpeaking(false);
        // Return to gentle friendly smile after finishing question
        setCharacterExpression('smiling');
      },
      onError: () => setIsModelSpeaking(false),
    });
  };

  // Read target sentence aloud (with 0.9x normal / 0.7x slow)
  const handlePlayTargetSentence = (slowOverride?: boolean) => {
    const useSlow = slowOverride !== undefined ? slowOverride : isSlowMode;
    stopSpeaking();
    recognizerRef.current?.stopListening();
    setMicState('ready');
    setCharacterExpression('encouraging');

    speakSentence({
      text: turn.studentTargetSentence,
      lang: character.accent,
      rate: useSlow ? 0.7 : 0.9,
      onStart: () => setIsModelSpeaking(true),
      onEnd: () => {
        setIsModelSpeaking(false);
        setCharacterExpression('smiling');
      },
      onError: () => setIsModelSpeaking(false),
    });
  };

  // Handle Mic Click: Ready -> Listening -> Done
  const handleMicClick = () => {
    if (isModelSpeaking) return;

    if (micState === 'listening') {
      // User tapped while listening -> Stop and evaluate
      recognizerRef.current?.stopListening();
      setMicState('done');
      triggerEvaluation(spokenTranscript);
    } else {
      // Ready or Done -> Start speaking immediately without delay
      setSpokenTranscript('');
      setErrorMessage(null);
      setMicState('listening');
      setCharacterExpression('listening');
      stopSpeaking();

      recognizerRef.current?.startListening({
        onStart: () => {
          setMicState('listening');
        },
        onTranscriptChange: (text: string, isFinal: boolean) => {
          setSpokenTranscript(text);
          if (isFinal && text.trim()) {
            setMicState('done');
            triggerEvaluation(text);
          }
        },
        onError: (errType: string, msg: string) => {
          setMicState('ready');
          setCharacterExpression('encouraging');
          setErrorMessage(msg);
          if (errType === 'no-speech') {
            // Trigger Section 7 "No speech recognized" fallback
            triggerEvaluation('');
          }
        },
        onEnd: () => {
          // If mic ended without final event, evaluate whatever was gathered
          setMicState((prev) => {
            if (prev === 'listening') {
              triggerEvaluation(spokenTranscript);
              return 'done';
            }
            return prev;
          });
        },
      });
    }
  };

  // Evaluate student speech via server endpoint (/api/evaluate-speech)
  const triggerEvaluation = async (transcriptToEvaluate: string) => {
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/evaluate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSentence: turn.studentTargetSentence,
          spokenText: transcriptToEvaluate,
          attemptCount,
          keywords: turn.keywords,
          character: characterId,
          turnNumber: turn.turnNumber,
          koreanMeaning: turn.studentTargetSentenceKo,
        }),
      });

      const data: SpeechEvaluation = await response.json();
      setEvaluation(data);

      const evaluatedEmotion: CharacterExpression =
        data.status === 'success'
          ? 'celebrating'
          : data.status === 'near_success'
          ? 'happy'
          : data.status === 'no_speech'
          ? 'puzzled'
          : 'encouraging';

      setCharacterExpression(evaluatedEmotion);

      // Play joyful confetti on success or high score
      if (data.status === 'success' || data.starsAwarded >= 4) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'],
        });
      }

      // Voice feedback with vivid character emotions
      if (data.status === 'no_speech') {
        speakSentence({
          text: 'Excuse me, can you say it again?',
          lang: character.accent,
          rate: 0.9,
          onStart: () => {
            setIsModelSpeaking(true);
            setCharacterExpression('puzzled');
          },
          onEnd: () => {
            setIsModelSpeaking(false);
            setCharacterExpression('encouraging');
          },
        });
      } else if (data.status === 'success') {
        speakSentence({
          text: data.feedbackEn || 'Good job! You said it wonderfully!',
          lang: character.accent,
          rate: 0.9,
          onStart: () => {
            setIsModelSpeaking(true);
            setCharacterExpression('celebrating');
          },
          onEnd: () => {
            setIsModelSpeaking(false);
            setCharacterExpression('happy');
          },
        });
      } else {
        // Near success or try again: gentle cheer
        speakSentence({
          text: data.feedbackEn,
          lang: character.accent,
          rate: 0.9,
          onStart: () => {
            setIsModelSpeaking(true);
            setCharacterExpression('encouraging');
          },
          onEnd: () => {
            setIsModelSpeaking(false);
            setCharacterExpression('smiling');
          },
        });
      }
    } catch (err) {
      console.error('Evaluation request error:', err);
      // Resilient fallback according to Section 7
      const fallback: SpeechEvaluation = {
        status: transcriptToEvaluate ? 'success' : 'no_speech',
        feedbackEn: transcriptToEvaluate
          ? 'Good job! You tried your best!'
          : 'Excuse me, can you say it again?',
        feedbackKo: transcriptToEvaluate
          ? '참 잘했어요! 멋지게 발음했어요!'
          : '미안해요, 다시 한 번 크게 말해 줄래요? 👂',
        characterExpression: transcriptToEvaluate ? 'smiling' : 'encouraging',
        matchedWords: turn.keywords,
        missingWords: [],
        pronunciationTip: '목소리를 밝고 크게 내면 발음이 훨씬 좋아져요!',
        starsAwarded: transcriptToEvaluate ? 5 : 1,
        guidanceStep: transcriptToEvaluate ? 'success' : 'recast',
      };
      setEvaluation(fallback);
      setCharacterExpression(fallback.characterExpression);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Try Again: reset mic and transcript, increment attempt counter
  const handleTryAgain = () => {
    stopSpeaking();
    recognizerRef.current?.stopListening();
    setMicState('ready');
    setSpokenTranscript('');
    setEvaluation(null);
    setAttemptCount((prev) => prev + 1);
    setCharacterExpression('smiling');
    setErrorMessage(null);
  };

  // Next Turn
  const handleNext = () => {
    stopSpeaking();
    recognizerRef.current?.stopListening();

    const record: TurnRecord = {
      turnNumber: turn.turnNumber,
      targetSentence: turn.studentTargetSentence,
      spokenText: spokenTranscript,
      attemptCount,
      evaluation: evaluation || {
        status: 'success',
        feedbackEn: 'Completed!',
        feedbackKo: '완료!',
        characterExpression: 'smiling',
        matchedWords: [],
        missingWords: [],
        pronunciationTip: '',
        starsAwarded: 5, // Section 6: Star rules reward completion!
        guidanceStep: 'success',
      },
      starsEarned: evaluation ? evaluation.starsAwarded : 5,
    };

    onTurnComplete(record);
  };

  // Highlight keywords or missed words in target sentence
  const renderHighlightedSentence = () => {
    const words = turn.studentTargetSentence.split(' ');
    const missing = evaluation?.missingWords?.map((w) => w.toLowerCase()) || [];

    return (
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 leading-relaxed">
        {words.map((word, idx) => {
          const clean = word.toLowerCase().replace(/[^\w]/g, '');
          const isKeyword = turn.keywords.some(
            (kw) => clean === kw.toLowerCase() || clean.includes(kw.toLowerCase())
          );
          const isMissed = missing.includes(clean);

          return (
            <span
              key={idx}
              className={`inline-block px-1.5 py-0.5 rounded-lg transition-colors font-extrabold ${
                isMissed
                  ? 'bg-rose-100 text-rose-700 underline decoration-rose-400 decoration-wavy'
                  : isKeyword
                  ? 'bg-blue-100/90 text-blue-900 shadow-2xs'
                  : 'text-slate-800'
              }`}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 md:py-8">
      {/* Top Bar: Progress and Star Rating for current page */}
      <div className="flex items-center justify-between mb-4 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
            {turn.turnNumber}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-700">
            {turn.turnNumber} / {totalTurns} 단계 연습
          </span>
        </div>

        {/* Section 6 requirement: "Make a rating out of 5 stars on each page (reward completion, not accuracy)" */}
        <div className="flex items-center gap-2">
          <StarRating score={evaluation ? evaluation.starsAwarded : 5} />
        </div>
      </div>

      {/* Screen 2 Top: Question in an English sentence */}
      <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200/80 rounded-3xl p-4 sm:p-5 shadow-md flex items-start gap-4">
        <CharacterAvatar
          characterId={characterId}
          expression={characterExpression}
          isSpeaking={isModelSpeaking}
          size="md"
          showEmotionBadge={true}
          className="shrink-0 mt-0.5"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
              <span>{character.name} ({character.nameKo})의 질문</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePlayPartnerQuestion}
                disabled={isModelSpeaking}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs cursor-pointer active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>질문 듣기</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQuestionKo(!showQuestionKo)}
                className="text-xs text-slate-500 hover:text-slate-700 underline px-1 cursor-pointer"
              >
                {showQuestionKo ? '해석 숨기기' : '해석 보기'}
              </button>
            </div>
          </div>

          <p className="text-lg sm:text-xl font-black text-slate-800">
            {turn.partnerPrompt}
          </p>
          {showQuestionKo && (
            <p className="text-xs sm:text-sm text-indigo-900/80 font-medium mt-1">
              💬 {turn.partnerPromptKo}
            </p>
          )}
        </div>
      </div>

      {/* Screen 2 Middle: Target sentence (largest text!) + [🔊 Listen] */}
      <div className="mb-6 bg-white border-3 border-blue-300 rounded-3xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            🎯 Student Target Sentence (따라 말할 문장)
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowKoMeaning(!showKoMeaning)}
              className="font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              {showKoMeaning ? '뜻 숨기기' : '뜻 보기'}
            </button>
          </div>
        </div>

        {/* LARGEST TEXT TARGET SENTENCE */}
        <div className="my-4 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight select-text py-2">
          {renderHighlightedSentence()}
        </div>

        {/* Korean Meaning */}
        {showKoMeaning && (
          <p className="text-sm sm:text-base font-bold text-slate-600 mb-5">
            "{turn.studentTargetSentenceKo}"
          </p>
        )}

        {/* Listen Controls: Normal rate (0.9) and Slow rate (0.7) as per Technical Requirements */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handlePlayTargetSentence(false)}
            disabled={isModelSpeaking}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isModelSpeaking && !isSlowMode
                ? 'bg-blue-600 text-white animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>🔊 원어민 소리 듣기 (0.9x)</span>
          </button>

          <button
            type="button"
            onClick={() => handlePlayTargetSentence(true)}
            disabled={isModelSpeaking}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${
              isModelSpeaking && isSlowMode
                ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 active:scale-95'
            }`}
          >
            <span>🐢 천천히 듣기 (0.7x)</span>
          </button>

          {/* Keywords pill */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl ml-2">
            <span>핵심 단어:</span>
            <span className="font-bold text-blue-700">{turn.keywords.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Screen 2 Bottom:
          1. Large round [🎤 Mic] button (Ready → Listening → Done)
          2. What the student said text box
          3. Feedback box
          4. Controls: [Try Again], [Next →], [Skip]
      */}
      <div className="bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-3xl p-6 shadow-lg mb-6">
        {/* Real-time Spoken Transcript Box */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 min-h-[64px] flex flex-col justify-center text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            내가 말한 문장 (What you said)
          </span>
          {spokenTranscript ? (
            <p className="text-base sm:text-lg font-extrabold text-indigo-900">
              "{spokenTranscript}"
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-400 italic">
              아래 큰 마이크 버튼을 누르고 편안하게 말해보세요!
            </p>
          )}
        </div>

        {/* Large Round Mic Button */}
        <div className="my-2 flex justify-center">
          <MicButton
            state={micState}
            onClick={handleMicClick}
            disabled={isModelSpeaking}
            isEvaluating={isEvaluating}
            disabledReason={isModelSpeaking ? '원어민 소리가 나오는 중이에요 🔊' : ''}
          />
        </div>

        {/* Error message notice if any */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-center">
            {errorMessage}
          </div>
        )}

        {/* Section 7 Feedback Box */}
        {evaluation && (
          <div
            className={`mt-6 p-5 rounded-2xl border-2 transition-all ${
              evaluation.status === 'success'
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : evaluation.status === 'near_success'
                ? 'bg-blue-50/80 border-blue-300 text-blue-950'
                : evaluation.status === 'no_speech'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-indigo-50/80 border-indigo-300 text-indigo-950'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <CharacterAvatar
                characterId={characterId}
                expression={evaluation.characterExpression}
                isSpeaking={isModelSpeaking}
                size="sm"
                showEmotionBadge={true}
                className="shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-extrabold text-sm sm:text-base">
                    {character.name}의 피드백:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        speakSentence({
                          text: evaluation.feedbackEn,
                          lang: character.accent,
                          rate: 0.9,
                          onStart: () => setIsModelSpeaking(true),
                          onEnd: () => setIsModelSpeaking(false),
                          onError: () => setIsModelSpeaking(false),
                        });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-white/90 hover:bg-white px-2 py-0.5 rounded-lg border border-indigo-200 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>피드백 소리 듣기</span>
                    </button>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                      {evaluation.status === 'success'
                        ? '🌟 참 잘했어요! (Success)'
                        : evaluation.status === 'near_success'
                        ? '👍 거의 다 맞았어요!'
                        : evaluation.status === 'no_speech'
                        ? '👂 소리가 들리지 않았어요'
                        : `💪 다시 도전! (${attemptCount}회차)`}
                    </span>
                  </div>
                </div>

                {/* English feedback */}
                <p className="text-base sm:text-lg font-black">{evaluation.feedbackEn}</p>
                {/* Korean feedback */}
                <p className="text-xs sm:text-sm mt-1 font-medium">{evaluation.feedbackKo}</p>

                {/* Pronunciation tip (focusing on r/l, articles) */}
                {evaluation.pronunciationTip && (
                  <div className="mt-3 p-3 bg-white/90 rounded-xl border border-current/20 text-xs flex items-start gap-2 shadow-2xs">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">발음 꿀팁: </span>
                      <span className="text-slate-700">{evaluation.pronunciationTip}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Control Buttons: [Try Again], [Next →], [Skip] */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTryAgain}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>다시 말하기 (Try Again)</span>
            </button>
            <button
              type="button"
              onClick={onSkipTurn}
              className="px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>건너뛰기 (Skip)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm sm:text-base font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 ml-auto"
          >
            <span>{turn.turnNumber < totalTurns ? '다음 문장으로 (Next →)' : '결과 확인하기 (Finish →)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
