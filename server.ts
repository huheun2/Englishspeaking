import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(geminiApiKey),
  });
});

// Helper for fallback evaluation matching Section 7 strictly
function algorithmicFallbackEvaluate(
  targetSentence: string,
  spokenText: string,
  attemptCount: number,
  keywords: string[]
) {
  const cleanTarget = targetSentence.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const cleanSpoken = spokenText.toLowerCase().replace(/[^\w\s]/g, '').trim();

  if (!cleanSpoken) {
    return {
      status: 'no_speech',
      feedbackEn: 'Excuse me, can you say it again?',
      feedbackKo: '미안해요, 다시 한 번 크게 말해 줄래요? 👂',
      characterExpression: 'puzzled',
      matchedWords: [],
      missingWords: keywords,
      pronunciationTip: '마이크를 누르고 천천히 또박또박 말해보세요!',
      starsAwarded: 1,
      guidanceStep: 'recast',
    };
  }

  const targetTokens = cleanTarget.split(/\s+/);
  const spokenTokens = cleanSpoken.split(/\s+/);

  const matchedKeywords = keywords.filter((kw) =>
    spokenTokens.some((st) => st === kw.toLowerCase() || st.includes(kw.toLowerCase()))
  );
  const allKeywordsSpoken = matchedKeywords.length >= Math.max(1, keywords.length);

  // Check word accuracy ratio
  let matchCount = 0;
  for (const t of targetTokens) {
    if (spokenTokens.includes(t)) matchCount++;
  }
  const ratio = targetTokens.length > 0 ? matchCount / targetTokens.length : 0;

  // Check for small missing words (a, an, the, to, of, in)
  const smallWords = ['a', 'an', 'the', 'to', 'of', 'in', 'and'];
  const missingSmall = targetTokens.filter(
    (w) => smallWords.includes(w) && !spokenTokens.includes(w)
  );

  if (ratio >= 0.8 || (allKeywordsSpoken && missingSmall.length === 0)) {
    return {
      status: 'success',
      feedbackEn: 'Good job! You said it wonderfully!',
      feedbackKo: '참 잘했어요! 멋지게 말했어요! 🌟',
      characterExpression: 'celebrating',
      matchedWords: targetTokens.filter((w) => spokenTokens.includes(w)),
      missingWords: [],
      pronunciationTip: '자신감 있게 말하는 모습이 최고예요! 완벽해요.',
      starsAwarded: 5,
      guidanceStep: 'success',
    };
  } else if (allKeywordsSpoken && missingSmall.length > 0) {
    return {
      status: 'near_success',
      feedbackEn: `Almost perfect! Don't forget "${missingSmall[0]}": ${targetSentence}`,
      feedbackKo: `거의 다 맞았어요! "${missingSmall[0]}" 단어를 쏙 넣어서 말해볼까요?`,
      characterExpression: 'happy',
      matchedWords: targetTokens.filter((w) => spokenTokens.includes(w)),
      missingWords: missingSmall,
      pronunciationTip: `작은 단어인 "${missingSmall.join(', ')}"도 함께 소리내면 더 유창해져요!`,
      starsAwarded: 4,
      guidanceStep: 'fill_in_word',
    };
  } else {
    // Failure handling based on attempt count (Section 7)
    if (attemptCount === 1) {
      // 1st failure: recast
      return {
        status: 'try_again',
        feedbackEn: `Let's practice together: "${targetSentence}"`,
        feedbackKo: `괜찮아요! 빈 부분을 채워서 다시 한 번 들어보고 말해볼까요?`,
        characterExpression: 'encouraging',
        matchedWords: targetTokens.filter((w) => spokenTokens.includes(w)),
        missingWords: targetTokens.filter((w) => !spokenTokens.includes(w)),
        pronunciationTip: `선생님/친구가 말하는 소리를 먼저 [🔊 Listen]으로 듣고 따라해보세요!`,
        starsAwarded: 3,
        guidanceStep: 'recast',
      };
    } else if (attemptCount === 2) {
      // 2nd failure: elicitation
      const startWords = targetTokens.slice(0, 3).join(' ');
      return {
        status: 'try_again',
        feedbackEn: `Can you start with "${startWords}..."?`,
        feedbackKo: `힌트: "${startWords}..." 로 시작해보세요!`,
        characterExpression: 'encouraging',
        matchedWords: targetTokens.filter((w) => spokenTokens.includes(w)),
        missingWords: targetTokens.filter((w) => !spokenTokens.includes(w)),
        pronunciationTip: `앞부분 "${startWords}"부터 천천히 시작해보면 훨씬 쉬워요!`,
        starsAwarded: 3,
        guidanceStep: 'elicitation',
      };
    } else {
      // 3rd failure: chunking
      const half = Math.ceil(targetTokens.length / 2);
      const chunk1 = targetTokens.slice(0, half).join(' ');
      const chunk2 = targetTokens.slice(half).join(' ');
      return {
        status: 'try_again',
        feedbackEn: `Let's break it down: [${chunk1}] + [${chunk2}]!`,
        feedbackKo: `두 덩어리로 나누어 말해봐요: [${chunk1}] 먼저, 그 다음 [${chunk2}]!`,
        characterExpression: 'encouraging',
        matchedWords: targetTokens.filter((w) => spokenTokens.includes(w)),
        missingWords: targetTokens.filter((w) => !spokenTokens.includes(w)),
        pronunciationTip: `한 번에 다 하려 하지 말고 두 토막으로 나눠서 해보세요!`,
        starsAwarded: 3,
        guidanceStep: 'chunking',
      };
    }
  }
}

// Endpoint: Evaluate Student Speech
app.post('/api/evaluate-speech', async (req: Request, res: Response) => {
  try {
    const {
      targetSentence = '',
      spokenText = '',
      attemptCount = 1,
      keywords = [],
      character = 'lucy',
      koreanMeaning = '',
    } = req.body;

    const trimmedSpoken = (spokenText || '').trim();

    // Check no speech recognized
    if (!trimmedSpoken) {
      const emptyResult = algorithmicFallbackEvaluate(
        targetSentence,
        '',
        attemptCount,
        keywords
      );
      res.json(emptyResult);
      return;
    }

    // Try Gemini evaluation if API key is configured
    if (ai) {
      try {
        const prompt = `You are evaluating an elementary school student (2nd to 4th grade, CEFR A2 level, Korean ESL learner) practicing English speaking.
App Name: "Where you want to go😎"
Character: ${character === 'oliver' ? 'Oliver (kind British friend)' : 'Lucy (warm, cheerful American teacher/friend)'}
Personality: Very kind, smiling, supportive, cheers them on.

Target English Sentence: "${targetSentence}"
Korean Meaning: "${koreanMeaning}"
Student Spoken Transcript (via Web Speech API): "${trimmedSpoken}"
Key Words Required: ${JSON.stringify(keywords)}
Attempt Number for this sentence: ${attemptCount}

Student Background & Common Pitfalls:
- Korean elementary learners often confuse /r/ and /l/ (e.g. travel, really, world, like, place, look).
- Often miss small articles or prepositions ("to", "a", "an", "the").
- Often feel embarrassed or shy about speaking English.

Feedback Rules (Section 7 PRD):
- Success: "good job!" and a big smile.
- Success + small word missing: Gentle recast filling in the word (e.g., "Almost! Remember 'to'...").
- 1st failure (recast): say it with the empty part highlighted.
- 2nd failure (elicitation): give an elicitation prompt (e.g., "Can you start with 'I want to...'?").
- 3rd failure (chunking): break into manageable chunks (e.g., "Chunk 1 + Chunk 2").
- Star rules: Reward completion and effort! (Give 5 stars for success/near success, 3 to 4 stars for trying).

Respond strictly with a JSON object adhering to this schema:
- status: "success" | "near_success" | "try_again" | "no_speech"
- feedbackEn: Short cheerful sentence (under 12 words, CEFR A2 friendly)
- feedbackKo: Friendly Korean cheer & guidance (1-2 sentences)
- characterExpression: "smiling" | "happy" | "encouraging" | "clapping"
- matchedWords: array of strings that matched
- missingWords: array of missing strings
- pronunciationTip: specific, easy tip in Korean (focus on R/L or clear vowels if relevant, e.g. "travel" or "world")
- starsAwarded: integer from 1 to 5 (completion reward: 3-5 stars)
- guidanceStep: "success" | "fill_in_word" | "recast" | "elicitation" | "chunking"
`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini evaluation timed out')), 4500)
        );

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                status: {
                  type: Type.STRING,
                  enum: ['success', 'near_success', 'try_again', 'no_speech'],
                },
                feedbackEn: { type: Type.STRING },
                feedbackKo: { type: Type.STRING },
                characterExpression: {
                  type: Type.STRING,
                  enum: [
                    'smiling',
                    'happy',
                    'encouraging',
                    'clapping',
                    'celebrating',
                    'curious',
                    'excited',
                    'puzzled',
                  ],
                },
                matchedWords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                missingWords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                pronunciationTip: { type: Type.STRING },
                starsAwarded: { type: Type.INTEGER },
                guidanceStep: {
                  type: Type.STRING,
                  enum: ['success', 'fill_in_word', 'recast', 'elicitation', 'chunking'],
                },
              },
              required: [
                'status',
                'feedbackEn',
                'feedbackKo',
                'characterExpression',
                'matchedWords',
                'missingWords',
                'pronunciationTip',
                'starsAwarded',
                'guidanceStep',
              ],
            },
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          res.json(parsed);
          return;
        }
      } catch (geminiErr) {
        console.warn('Gemini evaluation error, using fallback:', geminiErr);
      }
    }

    // Fallback if no Gemini key or error
    const fallbackResult = algorithmicFallbackEvaluate(
      targetSentence,
      trimmedSpoken,
      attemptCount,
      keywords
    );
    res.json(fallbackResult);
  } catch (error) {
    console.error('Server error in /api/evaluate-speech:', error);
    res.status(500).json({
      status: 'try_again',
      feedbackEn: 'Nice try! Let’s say it again together!',
      feedbackKo: '잘 도전했어요! 한 번 더 신나게 말해봐요!',
      characterExpression: 'encouraging',
      matchedWords: [],
      missingWords: [],
      pronunciationTip: '큰 목소리로 한 번 더 읽어봐요!',
      starsAwarded: 3,
      guidanceStep: 'recast',
    });
  }
});

// Endpoint: Translate Korean Dream (Place & Action) to English for Screen 1
app.post('/api/translate-dream', async (req: Request, res: Response) => {
  try {
    const { placeKo = '', actionKo = '' } = req.body;

    // Default fast dictionary for common elementary travel inputs
    const dictionary: Record<string, { en: string; sight: string }> = {
      파리: { en: 'Paris', sight: 'the Eiffel Tower' },
      런던: { en: 'London', sight: 'Big Ben' },
      뉴욕: { en: 'New York', sight: 'the Statue of Liberty' },
      도쿄: { en: 'Tokyo', sight: 'Tokyo Tower' },
      하와이: { en: 'Hawaii', sight: 'the beautiful beaches' },
      시드니: { en: 'Sydney', sight: 'the Opera House' },
      로마: { en: 'Rome', sight: 'the Colosseum' },
      캐나다: { en: 'Canada', sight: 'Niagara Falls' },
      스위스: { en: 'Switzerland', sight: 'the snowy Alps' },
      우주: { en: 'Space', sight: 'the shining stars' },
      바다: { en: 'the Ocean', sight: 'cute dolphins' },
      제주도: { en: 'Jeju Island', sight: 'Hallasan Mountain' },
    };

    const actionDictionary: Record<string, string> = {
      '에펠탑 보기': 'see the Eiffel Tower',
      '맛있는 음식 먹기': 'eat delicious food',
      '디즈니랜드 가기': 'go to Disneyland',
      '바다에서 수영하기': 'swim in the beautiful ocean',
      '새로운 친구 사귀기': 'make friendly new friends',
      '신기한 동물 만나기': 'see cute animals',
      '박물관 구경하기': 'visit famous museums',
      '쇼핑하기': 'go shopping for souvenirs',
      '사진 찍기': 'take pretty photos',
    };

    let placeEn = dictionary[placeKo.trim()]?.en || '';
    let actionEn = actionDictionary[actionKo.trim()] || '';

    if (ai) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Translate timed out')), 4000)
        );

        const prompt = `Translate this Korean travel destination and action into elementary-school-friendly English (CEFR A2).
Place (Korean): "${placeKo}"
Action (Korean): "${actionKo}"

Return JSON:
- placeEn: short English destination name (e.g. "Paris", "Hawaii", "Canada")
- actionEn: short English action / sight in present or infinitive verb phrase (e.g. "see the Eiffel Tower", "swim with dolphins", "eat delicious pizza")
- secondaryPlaceEn: a recommended alternative country or city for Turn 4 (e.g. "London", "Switzerland", "Japan")
- secondaryReasonEn: short simple reason for Turn 5 (e.g. "it looks so beautiful and exciting", "I love snowy mountains")
`;
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                placeEn: { type: Type.STRING },
                actionEn: { type: Type.STRING },
                secondaryPlaceEn: { type: Type.STRING },
                secondaryReasonEn: { type: Type.STRING },
              },
              required: ['placeEn', 'actionEn', 'secondaryPlaceEn', 'secondaryReasonEn'],
            },
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          res.json(parsed);
          return;
        }
      } catch (geminiErr) {
        console.warn('Gemini translate error, using fallback:', geminiErr);
      }
    }

    // Fallback translation
    if (!placeEn) {
      placeEn = placeKo.trim() || 'Paris';
    }
    actionEn =
      actionEn ||
      actionDictionary[actionKo.trim()] ||
      (actionKo.trim() ? `see ${actionKo.trim()}` : 'see a new world');

    res.json({
      placeEn: placeEn || 'Paris',
      actionEn: actionEn || 'see a new world',
      secondaryPlaceEn: 'London',
      secondaryReasonEn: 'it has wonderful castles and double-decker buses',
    });
  } catch (error) {
    console.error('Server error in /api/translate-dream:', error);
    res.json({
      placeEn: 'Paris',
      actionEn: 'see the Eiffel Tower',
      secondaryPlaceEn: 'London',
      secondaryReasonEn: 'it looks exciting and beautiful',
    });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Where you want to go😎] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
