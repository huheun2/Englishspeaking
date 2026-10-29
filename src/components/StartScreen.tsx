import React, { useState } from 'react';
import { Plane, Compass, Sparkles, MapPin, Activity, ShieldCheck, AlertCircle, ArrowRight, Volume2 } from 'lucide-react';
import { CharacterId, TravelGoal } from '../types';
import { CharacterAvatar, CHARACTERS_DATA } from './CharacterAvatar';
import { isSpeechRecognitionSupported, detectInAppBrowser, speakSentence } from '../utils/audio';

interface StartScreenProps {
  initialGoal: TravelGoal;
  selectedCharacter: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
  onStartPractice: (goal: TravelGoal) => void;
  isTranslating: boolean;
}

const PLACE_PRESETS = [
  { ko: '파리', en: 'Paris', emoji: '🇫🇷', desc: '에펠탑이 있는 낭만의 도시' },
  { ko: '런던', en: 'London', emoji: '🇬🇧', desc: '빅벤과 빨간 버스의 도시' },
  { ko: '하와이', en: 'Hawaii', emoji: '🌺', desc: '푸른 바다와 서핑의 천국' },
  { ko: '뉴욕', en: 'New York', emoji: '🗽', desc: '자유의 여신상이 있는 대도시' },
  { ko: '도쿄', en: 'Tokyo', emoji: '🇯🇵', desc: '맛있는 음식과 디즈니랜드' },
  { ko: '우주', en: 'Space', emoji: '🚀', desc: '반짝이는 별과 달나라' },
];

const ACTION_PRESETS = [
  { ko: '에펠탑 보기', en: 'see the Eiffel Tower', emoji: '🗼' },
  { ko: '맛있는 음식 먹기', en: 'eat delicious food', emoji: '🍕' },
  { ko: '디즈니랜드 가기', en: 'go to Disneyland', emoji: '🏰' },
  { ko: '바다에서 수영하기', en: 'swim in the beautiful ocean', emoji: '🏊' },
  { ko: '새로운 친구 사귀기', en: 'make friendly new friends', emoji: '🤝' },
  { ko: '신기한 동물 만나기', en: 'see cute and rare animals', emoji: '🐬' },
];

export const StartScreen: React.FC<StartScreenProps> = ({
  initialGoal,
  selectedCharacter,
  onSelectCharacter,
  onStartPractice,
  isTranslating,
}) => {
  const [placeKo, setPlaceKo] = useState(initialGoal.placeKo || '파리');
  const [actionKo, setActionKo] = useState(initialGoal.actionKo || '에펠탑 보기');

  const speechSupported = isSpeechRecognitionSupported();
  const inAppBrowser = detectInAppBrowser();

  const handleTestVoice = (id: CharacterId) => {
    const char = CHARACTERS_DATA[id];
    const greeting =
      id === 'lucy'
        ? "Hi there! I'm Lucy. Let's travel together!"
        : "Hello! I'm Oliver. Where would you like to travel?";
    speakSentence({ text: greeting, lang: char.accent, rate: 0.9 });
  };

  const handleStart = () => {
    onStartPractice({
      ...initialGoal,
      placeKo: placeKo.trim() || '파리',
      actionKo: actionKo.trim() || '에펠탑 보기',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Student Badge / PRD Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white p-3.5 sm:p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <Compass className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Where you want to go😎</h1>
            <p className="text-xs text-blue-100 font-medium">
              초등 2~4학년을 위한 맞춤형 여행 영어 말하기 앱 (CEFR A2)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-sm">
          <span>작성자: 허은</span>
          <span className="opacity-60">|</span>
          <span>학번: 2024315682</span>
        </div>
      </div>

      {/* Warnings & Guidance (In-app browser & Speech support) */}
      {(!speechSupported || inAppBrowser.isInApp) && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-sm flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">⚠️ 음성 인식 환경 안내</p>
            {!speechSupported && (
              <p className="mt-1">
                현재 브라우저에서는 음성 인식이 지원되지 않을 수 있어요. <strong>Google Chrome(크롬)</strong> 브라우저에서 열어주시면 마이크가 원활하게 작동합니다.
              </p>
            )}
            {inAppBrowser.isInApp && (
              <p className="mt-1">
                현재 <strong>{inAppBrowser.name}</strong> 인앱 브라우저로 접속 중입니다. 오른쪽 위 점 세 개(⋮) 메뉴를 눌러 <strong>[Chrome이나 기본 브라우저로 열기]</strong>를 선택해 주세요.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Start Card */}
      <div className="bg-white/90 backdrop-blur-sm border-2 border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Top: 어디에 가서 뭘 하고 싶어요? */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-bold mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
            <span>Screen 1 • 시작 화면</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            어디에 가서 뭘 하고 싶어요?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            가고 싶은 장소와 하고 싶은 일을 적으면, 원어민 친구와 영어로 5단계 대화를 나눌 수 있어요!
          </p>
        </div>

        {/* Middle: Split Box (장소 on the left, 행동 on the right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left Side: 장소 (Place) */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 p-5 rounded-2xl border-2 border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-base font-bold text-blue-900">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>장소 (Where to go)</span>
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-200/70 text-blue-800">
                왼쪽 박스
              </span>
            </div>

            <input
              type="text"
              value={placeKo}
              onChange={(e) => setPlaceKo(e.target.value)}
              placeholder="예: 파리, 런던, 하와이, 제주도, 우주"
              className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:ring-4 focus:ring-blue-200 transition-all text-base sm:text-lg shadow-inner"
            />

            {/* Quick Preset Chips */}
            <div className="mt-3">
              <p className="text-xs font-bold text-blue-700 mb-2">추천 여행지 클릭 ✈️</p>
              <div className="flex flex-wrap gap-1.5">
                {PLACE_PRESETS.map((preset) => (
                  <button
                    key={preset.ko}
                    type="button"
                    onClick={() => setPlaceKo(preset.ko)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      placeKo === preset.ko
                        ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-300'
                        : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-100 hover:text-blue-800'
                    }`}
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.ko}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: 행동 (Activity / Action) */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/70 p-5 rounded-2xl border-2 border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-base font-bold text-emerald-900">
                <Activity className="w-5 h-5 text-emerald-600" />
                <span>행동 (What to do)</span>
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-800">
                오른쪽 박스
              </span>
            </div>

            <input
              type="text"
              value={actionKo}
              onChange={(e) => setActionKo(e.target.value)}
              placeholder="예: 에펠탑 보기, 맛있는 피자 먹기, 수영하기"
              className="w-full px-4 py-3 bg-white border-2 border-emerald-300 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:ring-4 focus:ring-emerald-200 transition-all text-base sm:text-lg shadow-inner"
            />

            {/* Quick Preset Chips */}
            <div className="mt-3">
              <p className="text-xs font-bold text-emerald-700 mb-2">추천 활동 클릭 🎯</p>
              <div className="flex flex-wrap gap-1.5">
                {ACTION_PRESETS.map((preset) => (
                  <button
                    key={preset.ko}
                    type="button"
                    onClick={() => setActionKo(preset.ko)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      actionKo === preset.ko
                        ? 'bg-emerald-600 text-white shadow-md scale-105 ring-2 ring-emerald-300'
                        : 'bg-white text-slate-700 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800'
                    }`}
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.ko}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Character Selection (Requirement: Choose between two characters) */}
        <div className="mb-8 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
          <div className="text-center mb-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
              함께 대화할 친구를 골라보세요! 👫
            </h3>
            <p className="text-xs text-slate-500">
              원하는 캐릭터를 누르면 발음을 미리 들어볼 수 있어요.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['lucy', 'oliver'] as CharacterId[]).map((id) => {
              const char = CHARACTERS_DATA[id];
              const isSelected = selectedCharacter === id;

              return (
                <div
                  key={id}
                  onClick={() => onSelectCharacter(id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                    isSelected
                      ? 'border-indigo-500 bg-white shadow-lg ring-4 ring-indigo-100'
                      : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <CharacterAvatar
                    characterId={id}
                    expression={isSelected ? 'happy' : 'smiling'}
                    size="md"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-base">
                        {char.name} ({char.nameKo})
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {char.flag} {char.accent}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{char.introKo}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestVoice(id);
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      목소리 들어보기
                    </button>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-xs">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notice Requirement from Section 8 & Technical Requirements:
            "Show a small notice on the Start Screen: 'Your voice is processed to turn it into text and is not recorded or saved.'" */}
        <div className="mb-8 p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center gap-3 text-xs text-blue-800">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <span className="font-bold">안전 및 개인정보 보호: </span>
            <span>
              Your voice is processed to turn it into text and is not recorded or saved. (학생의 목소리는 텍스트 변환에만 사용되며 녹음되거나 서버에 저장되지 않습니다.)
            </span>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleStart}
            disabled={isTranslating}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer mx-auto"
          >
            {isTranslating ? (
              <>
                <Sparkles className="w-6 h-6 animate-spin" />
                <span>대화 준비하는 중...</span>
              </>
            ) : (
              <>
                <span>영어로 말하기 시작! Start Practice</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
