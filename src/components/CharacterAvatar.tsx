import React from 'react';
import { CharacterId, CharacterExpression } from '../types';

interface CharacterAvatarProps {
  characterId: CharacterId;
  expression?: CharacterExpression;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showEmotionBadge?: boolean;
  className?: string;
}

export const CHARACTERS_DATA: Record<
  CharacterId,
  {
    id: CharacterId;
    name: string;
    nameKo: string;
    role: string;
    country: string;
    flag: string;
    accent: 'en-US' | 'en-GB';
    color: string;
    badgeBg: string;
    badgeText: string;
    introKo: string;
  }
> = {
  lucy: {
    id: 'lucy',
    name: 'Lucy',
    nameKo: '루시 선생님',
    role: '미국인 친구 & 영어 선생님',
    country: 'United States',
    flag: '🇺🇸',
    accent: 'en-US',
    color: '#3B82F6',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    introKo: '밝고 상냥한 미국인 친구 루시! 언제나 환하게 웃으며 응원해 줘요.',
  },
  oliver: {
    id: 'oliver',
    name: 'Oliver',
    nameKo: '올리버 친구',
    role: '영국인 친구 & 여행 탐험가',
    country: 'United Kingdom',
    flag: '🇬🇧',
    accent: 'en-GB',
    color: '#10B981',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    introKo: '다정하고 예의 바른 영국인 친구 올리버! 여행 이야기를 아주 좋아해요.',
  },
};

const EMOTION_BADGES: Record<
  CharacterExpression,
  { label: string; emoji: string; colorClass: string }
> = {
  curious: { label: '궁금해요!', emoji: '❓', colorClass: 'bg-amber-100 text-amber-800 border-amber-300' },
  excited: { label: '신나요!', emoji: '✈️', colorClass: 'bg-sky-100 text-sky-800 border-sky-300' },
  happy: { label: '행복해요!', emoji: '🌟', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  celebrating: { label: '최고예요!', emoji: '🎉', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  encouraging: { label: '힘내요!', emoji: '💪', colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  clapping: { label: '짝짝짝!', emoji: '👏', colorClass: 'bg-purple-100 text-purple-800 border-purple-300' },
  puzzled: { label: '다시 말해줄래요?', emoji: '👂', colorClass: 'bg-rose-100 text-rose-800 border-rose-300' },
  listening: { label: '듣고 있어요!', emoji: '🎧', colorClass: 'bg-teal-100 text-teal-800 border-teal-300' },
  smiling: { label: '반가워요!', emoji: '😊', colorClass: 'bg-blue-100 text-blue-800 border-blue-300' },
  idle: { label: '대기 중', emoji: '✨', colorClass: 'bg-slate-100 text-slate-700 border-slate-300' },
};

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  characterId,
  expression = 'smiling',
  isSpeaking = false,
  size = 'lg',
  showEmotionBadge = false,
  className = '',
}) => {
  const isLucy = characterId === 'lucy';

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const badgeInfo = EMOTION_BADGES[expression] || EMOTION_BADGES.smiling;

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Outer Animated Halos & Sparkles according to Emotion */}
        {(expression === 'happy' || expression === 'celebrating' || expression === 'clapping') && (
          <span className="absolute -inset-3 rounded-full bg-amber-300/60 blur-lg animate-pulse pointer-events-none" />
        )}
        {expression === 'excited' && (
          <span className="absolute -inset-2.5 rounded-full bg-sky-400/40 blur-md animate-ping pointer-events-none" />
        )}
        {expression === 'curious' && (
          <span className="absolute -inset-2 rounded-full bg-indigo-300/40 blur-md pointer-events-none animate-pulse" />
        )}
        {expression === 'listening' && (
          <span className="absolute -inset-3 rounded-full bg-emerald-400/50 blur-md animate-ping pointer-events-none" />
        )}

        {/* Floating Emotion Particles when Speaking */}
        {isSpeaking && (
          <div className="absolute -top-3 -right-2 z-20 flex items-center gap-1 animate-bounce pointer-events-none">
            {expression === 'curious' && (
              <span className="text-base sm:text-lg bg-white/90 rounded-full px-1.5 py-0.5 shadow-md border border-indigo-200">
                ❓
              </span>
            )}
            {expression === 'excited' && (
              <span className="text-base sm:text-lg bg-white/90 rounded-full px-1.5 py-0.5 shadow-md border border-sky-200">
                ✈️
              </span>
            )}
            {(expression === 'happy' || expression === 'celebrating') && (
              <span className="text-base sm:text-lg bg-white/90 rounded-full px-1.5 py-0.5 shadow-md border border-amber-200">
                ✨
              </span>
            )}
            {expression === 'encouraging' && (
              <span className="text-base sm:text-lg bg-white/90 rounded-full px-1.5 py-0.5 shadow-md border border-indigo-200">
                💡
              </span>
            )}
            {expression === 'puzzled' && (
              <span className="text-base sm:text-lg bg-white/90 rounded-full px-1.5 py-0.5 shadow-md border border-rose-200">
                👂
              </span>
            )}
          </div>
        )}

        {/* Sound Waves when Speaking */}
        {isSpeaking && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-20 pointer-events-none">
            <span className="w-1.5 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="w-2 h-5 bg-indigo-500 rounded-full animate-bounce" />
            <span className="w-1.5 h-3 bg-blue-500 rounded-full animate-pulse" />
          </div>
        )}

        {/* SVG Face Container with speaking bob/sway motion */}
        <div
          className={`w-full h-full rounded-full transition-transform duration-300 ${
            isSpeaking ? 'animate-[bounce_0.8s_infinite]' : 'hover:scale-105'
          }`}
          style={{
            animationDuration: isSpeaking ? '0.7s' : '0s',
          }}
        >
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full drop-shadow-lg rounded-full overflow-hidden"
          >
            <defs>
              <linearGradient id={`bg-${characterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isLucy ? '#EFF6FF' : '#ECFDF5'} />
                <stop
                  offset="100%"
                  stopColor={
                    expression === 'excited'
                      ? isLucy
                        ? '#BAE6FD'
                        : '#A7F3D0'
                      : isLucy
                      ? '#DBEAFE'
                      : '#D1FAE5'
                  }
                />
              </linearGradient>

              <linearGradient id={`hair-${characterId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isLucy ? '#F59E0B' : '#78350F'} />
                <stop offset="100%" stopColor={isLucy ? '#D97706' : '#451A03'} />
              </linearGradient>

              <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="100%" stopColor="#FDBA74" />
              </linearGradient>
            </defs>

            {/* Background disc */}
            <circle cx="60" cy="60" r="58" fill={`url(#bg-${characterId})`} />

            {/* Hair - Back (for Lucy) */}
            {isLucy && (
              <path
                d="M24 52 C18 85 28 106 35 110 C45 95 38 75 38 65 Z M96 52 C102 85 92 106 85 110 C75 95 82 75 82 65 Z"
                fill="url(#hair-lucy)"
              />
            )}

            {/* Neck */}
            <rect x="52" y="88" width="16" height="18" rx="5" fill="#FDBA74" />

            {/* Clothes / Shirt */}
            {isLucy ? (
              <path d="M28 115 C34 94 86 94 92 115 Z" fill="#3B82F6" />
            ) : (
              <path d="M28 115 C34 94 86 94 92 115 Z" fill="#059669" />
            )}
            {/* Oliver's Red Tie */}
            {!isLucy && (
              <polygon points="60,97 55,112 60,119 65,112" fill="#DC2626" />
            )}

            {/* Head / Face */}
            <ellipse
              cx="60"
              cy="62"
              rx="30"
              ry="32"
              fill="url(#skin)"
              transform={
                expression === 'curious'
                  ? 'rotate(-2.5 60 62)'
                  : expression === 'puzzled'
                  ? 'rotate(3.5 60 62)'
                  : undefined
              }
            />

            {/* Rosy Blushing Cheeks (more intense when excited or happy) */}
            <circle
              cx="40"
              cy="69"
              r={expression === 'happy' || expression === 'excited' || expression === 'celebrating' ? 7 : 5.5}
              fill="#FDA4AF"
              opacity={expression === 'happy' || expression === 'excited' ? '0.85' : '0.6'}
            />
            <circle
              cx="80"
              cy="69"
              r={expression === 'happy' || expression === 'excited' || expression === 'celebrating' ? 7 : 5.5}
              fill="#FDA4AF"
              opacity={expression === 'happy' || expression === 'excited' ? '0.85' : '0.6'}
            />

            {/* Ears */}
            <circle cx="28" cy="63" r="5" fill="#FDBA74" />
            <circle cx="92" cy="63" r="5" fill="#FDBA74" />

            {/* Hair - Front */}
            {isLucy ? (
              <path
                d="M29 55 C29 32 44 22 60 22 C76 22 91 32 91 55 C83 45 74 42 60 44 C46 42 37 45 29 55 Z"
                fill="url(#hair-lucy)"
              />
            ) : (
              <path
                d="M27 52 C27 30 44 24 60 24 C76 24 93 30 93 52 C87 42 75 38 60 40 C45 38 33 42 27 52 Z"
                fill="url(#hair-oliver)"
              />
            )}

            {/* --- EYEBROWS (Highly expressive according to emotion) --- */}
            {expression === 'curious' ? (
              // One eyebrow raised in inquisitive curiosity
              <>
                <path d="M42 43 Q48 37 54 42" stroke="#374151" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <path d="M66 47 Q72 44 78 48" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            ) : expression === 'excited' ? (
              // Raised high, eager arched eyebrows
              <>
                <path d="M42 43 Q48 38 54 43" stroke="#374151" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <path d="M66 43 Q72 38 78 43" stroke="#374151" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </>
            ) : expression === 'happy' || expression === 'celebrating' || expression === 'clapping' ? (
              // Cheerful lifted eyebrows
              <>
                <path d="M42 45 Q48 40 54 44" stroke="#374151" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <path d="M66 44 Q72 40 78 45" stroke="#374151" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </>
            ) : expression === 'puzzled' ? (
              // Puzzled / tilted caring eyebrows
              <>
                <path d="M43 47 Q48 44 54 45" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M66 44 Q71 42 77 46" stroke="#374151" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </>
            ) : expression === 'encouraging' ? (
              // Warm, kind comforting slant
              <>
                <path d="M43 45 Q48 43 54 47" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M66 47 Q72 43 77 45" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            ) : (
              // Standard friendly eyebrows
              <>
                <path d="M43 46 Q49 43 54 46" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M66 46 Q71 43 77 46" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}

            {/* --- EYES (Expressive and responsive to emotion) --- */}
            {expression === 'happy' || expression === 'celebrating' || expression === 'clapping' ? (
              // Joyful crescent singing eyes ^_^
              <>
                <path d="M42 58 Q48 48 54 58" stroke="#111827" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                <path d="M66 58 Q72 48 78 58" stroke="#111827" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              </>
            ) : expression === 'excited' ? (
              // Wide open sparkling excited eyes with dual star highlights
              <>
                <circle cx="49" cy="56" r="5.2" fill="#111827" />
                <circle cx="51.2" cy="53.8" r="2.2" fill="#FFFFFF" />
                <circle cx="47.5" cy="57.5" r="1.1" fill="#FFFFFF" />
                <circle cx="71" cy="56" r="5.2" fill="#111827" />
                <circle cx="73.2" cy="53.8" r="2.2" fill="#FFFFFF" />
                <circle cx="69.5" cy="57.5" r="1.1" fill="#FFFFFF" />
              </>
            ) : expression === 'curious' ? (
              // Inquisitive, questioning wide eyes looking slightly up/side
              <>
                <circle cx="49" cy="55.5" r="4.8" fill="#111827" />
                <circle cx="51" cy="53.5" r="2" fill="#FFFFFF" />
                <circle cx="71" cy="55.5" r="4.8" fill="#111827" />
                <circle cx="73" cy="53.5" r="2" fill="#FFFFFF" />
              </>
            ) : expression === 'listening' ? (
              // Attentive listening eyes
              <>
                <circle cx="49" cy="56" r="5" fill="#111827" />
                <circle cx="51" cy="54" r="1.8" fill="#FFFFFF" />
                <circle cx="71" cy="56" r="5" fill="#111827" />
                <circle cx="73" cy="54" r="1.8" fill="#FFFFFF" />
              </>
            ) : (
              // Friendly sparkling eyes
              <>
                <circle cx="49" cy="56" r="4.5" fill="#111827" />
                <circle cx="50.8" cy="54.2" r="1.6" fill="#FFFFFF" />
                <circle cx="71" cy="56" r="4.5" fill="#111827" />
                <circle cx="72.8" cy="54.2" r="1.6" fill="#FFFFFF" />
              </>
            )}

            {/* Nose */}
            <circle cx="60" cy="64" r="2" fill="#EA580C" opacity="0.4" />

            {/* --- MOUTH (Dynamic talking animation matching emotions when speaking) --- */}
            {isSpeaking ? (
              expression === 'curious' ? (
                // Inquisitive talking mouth moving between "O" and open questioning shape
                <ellipse cx="60" cy="77" rx="6.5" ry="5.5" fill="#991B1B">
                  <animate attributeName="ry" values="4;7;3;6;4" dur="0.32s" repeatCount="indefinite" />
                  <animate attributeName="rx" values="6;5;7;6;6" dur="0.32s" repeatCount="indefinite" />
                </ellipse>
              ) : expression === 'excited' ? (
                // Wide excited talking mouth with visible upper teeth and tongue!
                <g>
                  <path d="M48 72 Q60 88 72 72 Z" fill="#991B1B">
                    <animate
                      attributeName="d"
                      values="M48 72 Q60 88 72 72 Z; M49 73 Q60 82 71 73 Z; M48 72 Q60 90 72 72 Z; M48 72 Q60 88 72 72 Z"
                      dur="0.28s"
                      repeatCount="indefinite"
                    />
                  </path>
                  {/* Upper teeth */}
                  <path d="M51 72 Q60 74 69 72 Q65 76 60 76 Q55 76 51 72 Z" fill="#FFFFFF" />
                  {/* Tongue */}
                  <ellipse cx="60" cy="80" rx="4" ry="2.5" fill="#F87171" />
                </g>
              ) : expression === 'happy' || expression === 'celebrating' ? (
                // Joyful singing/laughing open mouth
                <g>
                  <path d="M47 71 Q60 89 73 71 Z" fill="#991B1B">
                    <animate
                      attributeName="d"
                      values="M47 71 Q60 89 73 71 Z; M49 73 Q60 83 71 73 Z; M47 71 Q60 91 73 71 Z"
                      dur="0.25s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path d="M50 71 Q60 73 70 71 Q66 75 60 75 Q54 75 50 71 Z" fill="#FFFFFF" />
                </g>
              ) : expression === 'encouraging' ? (
                // Warm encouraging talking smile
                <g>
                  <ellipse cx="60" cy="76" rx="7" ry="4.5" fill="#991B1B">
                    <animate attributeName="ry" values="3.5;6;3.5" dur="0.3s" repeatCount="indefinite" />
                  </ellipse>
                  <path d="M50 73 Q60 77 70 73" stroke="#B91C1C" strokeWidth="1.5" fill="none" />
                </g>
              ) : (
                // Lively standard speaking mouth
                <ellipse cx="60" cy="76" rx="7.5" ry="5.5" fill="#991B1B">
                  <animate attributeName="ry" values="3.5;7.5;4;6;3.5" dur="0.3s" repeatCount="indefinite" />
                  <animate attributeName="rx" values="7;8;6.5;7.5;7" dur="0.3s" repeatCount="indefinite" />
                </ellipse>
              )
            ) : expression === 'happy' || expression === 'celebrating' || expression === 'clapping' ? (
              // Big joyful static smile showing teeth
              <g>
                <path d="M47 72 Q60 88 73 72 Z" fill="#B91C1C" />
                <path d="M50 72 Q60 74 70 72 Q66 76 60 76 Q54 76 50 72 Z" fill="#FFFFFF" />
              </g>
            ) : expression === 'excited' ? (
              // Excited broad smile
              <path d="M48 72 Q60 87 72 72 Z" fill="#B91C1C" />
            ) : expression === 'encouraging' ? (
              // Encouraging friendly smile
              <path d="M49 74 Q60 84 71 74" stroke="#B91C1C" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            ) : expression === 'curious' ? (
              // Inquiring little smile
              <path d="M51 74 Q60 81 69 74" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            ) : expression === 'puzzled' ? (
              // Puzzled slightly tilted mouth
              <path d="M52 75 Q60 78 68 73" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            ) : (
              // Standard warm smile
              <path d="M50 74 Q60 83 70 74" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}
          </svg>
        </div>

        {/* Flag Badge */}
        <span
          className="absolute -bottom-1 -right-1 text-base bg-white shadow-md rounded-full px-1.5 py-0.5 border border-slate-100 pointer-events-none"
          title={CHARACTERS_DATA[characterId].country}
        >
          {CHARACTERS_DATA[characterId].flag}
        </span>
      </div>

      {/* Optional Emotion Label Badge */}
      {showEmotionBadge && (
        <div
          className={`mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-2xs transition-all ${
            badgeInfo.colorClass
          } ${isSpeaking ? 'scale-105 ring-2 ring-blue-300 animate-pulse' : ''}`}
        >
          <span>{badgeInfo.emoji}</span>
          <span>{isSpeaking ? `말하는 중: ${badgeInfo.label}` : badgeInfo.label}</span>
        </div>
      )}
    </div>
  );
};
