import { Position, FactCheckResult } from '../types/discussion';

export interface SpeechMessage {
  id: string;
  speakerName: string;
  position: Position;
  content: string;
  factCheck?: {
    result: FactCheckResult;
    explanation: string;
    source: string;
  };
  timestamp: Date;
}

export const MOCK_SPEECH_MESSAGES: SpeechMessage[] = [
  {
    id: '1',
    speakerName: '김민수',
    position: 'A입장',
    content: 'AI는 인간의 창의성을 대체하는 것이 아니라 보완하는 역할을 합니다. 실제로 많은 예술가들이 AI 도구를 활용해 더욱 혁신적인 작품을 만들어내고 있습니다.',
    factCheck: {
      result: '사실',
      explanation: '최근 연구에 따르면 AI 도구를 활용한 창작자들의 작품 다양성이 증가했다는 결과가 있습니다.',
      source: 'MIT Technology Review, 2024'
    },
    timestamp: new Date('2025-08-09T23:48:09')
  },
  {
    id: '2',
    speakerName: '이영희',
    position: 'B입장',
    content: '하지만 AI가 인간의 고유한 감정과 경험에서 나오는 진정한 창의성을 대체할 수는 없다고 봅니다. 창의성의 본질은 인간만이 가질 수 있는 것이죠.',
    factCheck: {
      result: '불분명',
      explanation: '창의성의 정의에 대한 철학적 관점으로, 객관적 사실보다는 주관적 견해입니다.',
      source: '창의성 연구 논문들'
    },
    timestamp: new Date('2025-08-09T23:49:15')
  },
  {
    id: '3',
    speakerName: '박철수',
    position: 'A입장',
    content: 'AI 도구는 단순히 기술적 보조 수단이 아닙니다. 새로운 아이디어를 발굴하고 실험할 수 있는 파트너 역할을 하고 있어요. 음악 작곡에서도 이미 증명되고 있습니다.',
    factCheck: {
      result: '사실',
      explanation: 'AI 작곡 도구들이 실제로 음악 산업에서 활발히 사용되고 있으며, 다수의 히트곡에 AI가 활용되었습니다.',
      source: 'Billboard, 2024년 AI 음악 보고서'
    },
    timestamp: new Date('2025-08-09T23:50:22')
  },
  {
    id: '4',
    speakerName: '정미경',
    position: 'B입장',
    content: 'AI가 만든 것은 결국 기존 데이터의 재조합일 뿐입니다. 진정한 창의성은 무에서 유를 창조하는 것이고, 이는 인간만이 할 수 있는 일이라고 생각합니다.',
    factCheck: {
      result: '거짓',
      explanation: 'AI는 기존 데이터를 학습하지만, 새로운 조합을 통해 이전에 없던 결과물을 만들어낼 수 있습니다.',
      source: 'Nature AI 연구지, 2024'
    },
    timestamp: new Date('2025-08-09T23:51:38')
  },
  {
    id: '5',
    speakerName: '김민수',
    position: 'A입장',
    content: '인간도 결국 과거의 경험과 학습을 바탕으로 창작을 하는 것입니다. AI와 인간의 창작 과정이 본질적으로 다르다고 보기는 어려울 것 같아요.',
    factCheck: {
      result: '불분명',
      explanation: '인간의 창작 과정과 AI의 학습 과정을 비교하는 철학적 관점으로, 다양한 견해가 존재합니다.',
      source: '인지과학 연구 논문들'
    },
    timestamp: new Date('2025-08-09T23:52:45')
  },
  {
    id: '6',
    speakerName: '김민수',
    position: 'A입장',
    content: '결국 핵심은 AI를 도구로 활용하되, 그 도구를 통해 인간만의 고유한 관점과 철학을 표현하는 것이라고 봅니다. 청중 여러분들의 다양한 의견들을 보니 더욱 확신이 듭니다.',
    factCheck: {
      result: '불분명',
      explanation: '개인적 견해와 철학적 관점으로, 주관적 판단에 해당합니다.',
      source: '토론 참여자 의견'
    },
    timestamp: new Date('2025-08-09T23:54:20')
  }
];