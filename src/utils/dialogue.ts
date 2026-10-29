import { DialogueTurn, TravelGoal } from '../types';

export function createDialogueTurns(goal: TravelGoal): DialogueTurn[] {
  const place = goal.placeEn || 'Paris';
  const placeKo = goal.placeKo || '파리';

  // Format action for turn 3: "I want to see ..."
  let actionSight = goal.actionEn || 'the sights';
  if (actionSight.toLowerCase().startsWith('see ')) {
    actionSight = actionSight.slice(4).trim();
  }
  const actionKo = goal.actionKo || '새로운 것들을 구경하기';

  const secondary = goal.secondaryPlaceEn || 'London';
  const secondaryReason = goal.secondaryReasonEn || 'it looks wonderful and beautiful';

  return [
    {
      turnNumber: 1,
      partnerPrompt: 'Where do you want to travel to?',
      partnerPromptKo: '어디로 여행을 가고 싶나요?',
      studentTargetSentence: `I want to travel to ${place}.`,
      studentTargetSentenceKo: `${placeKo}에 여행가고 싶어요.`,
      keywords: ['travel', 'to'],
      pronunciationFocus: ['travel', 'to', place],
    },
    {
      turnNumber: 2,
      partnerPrompt: 'Why do you want to go there?',
      partnerPromptKo: '왜 그곳에 가고 싶나요?',
      studentTargetSentence: 'I want to go there because I like to see a new world.',
      studentTargetSentenceKo: '세상을 구경하고 싶어서 거기에 가고 싶어요.',
      keywords: ['new', 'world', 'there', 'like'],
      pronunciationFocus: ['world', 'like', 'there'],
    },
    {
      turnNumber: 3,
      partnerPrompt: 'What do you want to see there?',
      partnerPromptKo: '거기서 무엇을 보고 싶나요?',
      studentTargetSentence: `I want to see ${actionSight}.`,
      studentTargetSentenceKo: `${actionKo}를 보고 싶어요.`,
      keywords: ['want to see', 'see'],
      pronunciationFocus: ['want to see', actionSight],
    },
    {
      turnNumber: 4,
      partnerPrompt: 'Is there another country you want to travel to?',
      partnerPromptKo: '또 여행하고 싶은 다른 나라가 있나요?',
      studentTargetSentence: `Yes, I also want to go to ${secondary}.`,
      studentTargetSentenceKo: `네, ${secondary}에도 가고 싶어요.`,
      keywords: ['also', 'want to go to'],
      pronunciationFocus: ['also', 'really'],
    },
    {
      turnNumber: 5,
      partnerPrompt: 'Why is that?',
      partnerPromptKo: '왜 그런가요?',
      studentTargetSentence: `It is because ${secondaryReason}.`,
      studentTargetSentenceKo: '왜냐하면 정말 멋지고 재미있어 보이기 때문이에요.',
      keywords: ['because'],
      pronunciationFocus: ['because', 'really', 'lovely'],
    },
  ];
}
