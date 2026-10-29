import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Star,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Home,
  MapPin,
  Heart,
  Volume2,
} from 'lucide-react';
import { CharacterId, TravelGoal, TurnRecord } from '../types';
import { CharacterAvatar, CHARACTERS_DATA } from './CharacterAvatar';
import { StarRating } from './StarRating';
import { speakSentence } from '../utils/audio';

interface ResultScreenProps {
  records: TurnRecord[];
  travelGoal: TravelGoal;
  characterId: CharacterId;
  onRestart: () => void;
  onNewDream: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  records,
  travelGoal,
  characterId,
  onRestart,
  onNewDream,
}) => {
  const character = CHARACTERS_DATA[characterId];

  // Calculate total stars: Section 6 rewards completion!
  const totalStars = records.reduce((acc, cur) => acc + (cur.starsEarned || 5), 0);
  const maxPossibleStars = records.length * 5;

  const [isSpeaking, setIsSpeaking] = React.useState(false);

  useEffect(() => {
    // Grand celebration confetti
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Voice congratulations with emotional animation
    const timer = setTimeout(() => {
      speakSentence({
        text: `Congratulations! You did a fantastic job talking about ${travelGoal.placeEn}! You are an amazing English speaker!`,
        lang: character.accent,
        rate: 0.9,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [character.accent, travelGoal.placeEn]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
      {/* Screen 3 Top: The score comes out */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden mb-6">
        {/* Decorative sparkles */}
        <div className="absolute top-3 left-4 text-white/30 text-4xl animate-pulse">✨</div>
        <div className="absolute bottom-4 right-5 text-white/30 text-5xl animate-bounce">✈️</div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-xs sm:text-sm font-extrabold mb-3">
          <Trophy className="w-4 h-4 text-amber-200" />
          <span>Screen 3 • 말하기 완료 & 결과 증서</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
          축하해요! 여행 영어 완성! 🎉
        </h2>
        <p className="text-sm sm:text-base text-amber-100 font-bold max-w-md mx-auto">
          {travelGoal.placeKo} ({travelGoal.placeEn}) 여행에 대한 내 생각을 영어로 멋지게 말했어요!
        </p>

        {/* Big Score Box */}
        <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-4 bg-white/15 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-5xl font-black text-amber-100 drop-shadow-md">
              {totalStars}
            </span>
            <span className="text-xl font-bold text-white/80">
              / {maxPossibleStars} 별 ⭐
            </span>
          </div>

          <div className="sm:border-l sm:border-white/30 sm:pl-4 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-100">
              <Award className="w-4 h-4 text-amber-200" />
              <span>성실 달성도 100% (Reward Completion!)</span>
            </div>
            <p className="text-xs text-white/90 mt-0.5">
              쑥스러움을 이겨내고 5문장을 끝까지 완성했어요!
            </p>
          </div>
        </div>
      </div>

      {/* Screen 3 Middle: Pronunciation and Feedback Provided */}
      <div className="bg-white/90 backdrop-blur-sm border-2 border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-lg mb-6">
        {/* Character Celebration Speech */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 mb-6">
          <CharacterAvatar
            characterId={characterId}
            expression="celebrating"
            isSpeaking={isSpeaking}
            showEmotionBadge={true}
            size="md"
            className="shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-indigo-900">
                {character.name} ({character.nameKo})의 총평:
              </span>
              <button
                type="button"
                onClick={() =>
                  speakSentence({
                    text: `Great job! You spoke very clearly and practiced all sentences! I'm so proud of you!`,
                    lang: character.accent,
                    rate: 0.9,
                    onStart: () => setIsSpeaking(true),
                    onEnd: () => setIsSpeaking(false),
                    onError: () => setIsSpeaking(false),
                  })
                }
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs cursor-pointer active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>다시 듣기</span>
              </button>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-slate-800 mt-1">
              "Great job! You spoke very clearly and practiced all sentences! I'm so proud of you!"
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              "정말 잘했어요! 또박또박 자신감 있게 끝까지 연습한 모습이 정말 자랑스러워요!"
            </p>
          </div>
        </div>

        {/* Detailed Sentence Log & Pronunciation Reviews */}
        <h3 className="text-base sm:text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <span>내가 완성한 여행 대화 5문장</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            총 {records.length}문장
          </span>
        </h3>

        <div className="space-y-3">
          {records.map((rec, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-500">
                  Step {rec.turnNumber}.
                </span>
                <StarRating score={rec.starsEarned || 5} size="sm" showLabel={false} />
              </div>

              {/* Target Sentence */}
              <p className="text-sm sm:text-base font-extrabold text-slate-800">
                "{rec.targetSentence}"
              </p>

              {/* What Student Said */}
              {rec.spokenText && (
                <p className="text-xs text-indigo-700 font-semibold mt-1">
                  🎙️ 학생 발화: "{rec.spokenText}"
                </p>
              )}

              {/* Feedback note */}
              {rec.evaluation?.pronunciationTip && (
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 {rec.evaluation.pronunciationTip}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Pronunciation & Common Pitfalls Summary */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
          <p className="font-extrabold text-sm mb-1">
            🌟 초등 영어 발음 성장 포인트 (R vs L 발음 & 작은 단어들)
          </p>
          <ul className="list-disc list-inside space-y-1 text-amber-800">
            <li>
              <strong>travel, really, world:</strong> 혀를 입천장에 닿지 않게 살짝 둥글게 말아주는 R 소리를 잘 연습했어요!
            </li>
            <li>
              <strong>like, look, also:</strong> 혀끝을 윗니 뒤에 가볍게 대고 떼는 L 소리를 또렷하게 내보세요.
            </li>
            <li>
              <strong>to, a, an, the:</strong> 문장 속 작은 단어들도 빼먹지 않고 챙기면 더욱 유창한 원어민 표현이 돼요!
            </li>
          </ul>
        </div>
      </div>

      {/* Screen 3 Bottom: [Try another place], [Finish] button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-2 border-indigo-300 hover:border-indigo-400 bg-white text-indigo-700 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-5 h-5 text-indigo-500" />
          <span>이 여행지로 다시 연습하기</span>
        </button>

        <button
          type="button"
          onClick={onNewDream}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
        >
          <MapPin className="w-5 h-5" />
          <span>새로운 여행지 고르기 (Try Another Place)</span>
        </button>
      </div>
    </div>
  );
};
