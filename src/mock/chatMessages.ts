import { Position } from '../types/discussion';

export interface ChatMessage {
  id: string;
  userName: string;
  message: string;
  timestamp: Date;
  userPosition: Position | null;
  isSpeaker: boolean;
}

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    userName: '토론러버',
    message: '드디어 시작되네요! 기대됩니다',
    timestamp: new Date('2025-08-09T23:18:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '2',
    userName: 'AI전문가',
    message: '요즘 AI 발전이 정말 빠른 것 같아요',
    timestamp: new Date('2025-08-09T23:19:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '3',
    userName: '예술가지망생',
    message: '창작자 입장에서는 복잡한 심경입니다',
    timestamp: new Date('2025-08-09T23:20:09'),
    userPosition: 'B입장',
    isSpeaker: false
  },
  {
    id: '4',
    userName: '관찰자1',
    message: '김민수님의 발언이 인상적이네요',
    timestamp: new Date('2025-08-09T23:21:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '5',
    userName: '철학도',
    message: '창의성의 정의부터 생각해봐야겠어요',
    timestamp: new Date('2025-08-09T23:22:09'),
    userPosition: 'B입장',
    isSpeaker: false
  },
  {
    id: '6',
    userName: '김민수',
    message: '청중 여러분들과 소통하고 싶어요!',
    timestamp: new Date('2025-08-09T23:23:09'),
    userPosition: 'A입장',
    isSpeaker: true
  },
  {
    id: '7',
    userName: '학생A',
    message: '과제할 때 AI 써도 되나요? ㅠㅠ',
    timestamp: new Date('2025-08-09T23:24:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '8',
    userName: '관찰자2',
    message: '이영희님 말도 일리가 있네요',
    timestamp: new Date('2025-08-09T23:25:09'),
    userPosition: 'B입장',
    isSpeaker: false
  },
  {
    id: '9',
    userName: '박철수',
    message: '음악 분야 전문가로서 더 설명드리고 싶네요',
    timestamp: new Date('2025-08-09T23:26:09'),
    userPosition: 'A입장',
    isSpeaker: true
  },
  {
    id: '10',
    userName: '테크기업직장인',
    message: '기술 발전과 인간 고유성의 균형이 중요할 것 같아요',
    timestamp: new Date('2025-08-09T23:27:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '11',
    userName: '디자이너김',
    message: 'AI 디자인 툴 쓰면서 느끼는 건데... 정말 편해요',
    timestamp: new Date('2025-08-09T23:28:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '12',
    userName: '전통화가',
    message: '하지만 붓으로 직접 그리는 맛은 못 따라오죠',
    timestamp: new Date('2025-08-09T23:29:09'),
    userPosition: 'B입장',
    isSpeaker: false
  },
  {
    id: '13',
    userName: '대학생B',
    message: '제 졸업작품도 AI 도움 받아서 했는데...',
    timestamp: new Date('2025-08-09T23:30:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '14',
    userName: '교수님',
    message: '창의성의 본질에 대해 다시 생각해볼 필요가 있겠네요',
    timestamp: new Date('2025-08-09T23:31:09'),
    userPosition: 'B입장',
    isSpeaker: false
  },
  {
    id: '15',
    userName: '이영희',
    message: '인간만의 고유한 감성이 있다고 생각해요',
    timestamp: new Date('2025-08-09T23:32:09'),
    userPosition: 'B입장',
    isSpeaker: true
  },
  {
    id: '16',
    userName: '작곡가',
    message: 'AI 작곡 도구가 아이디어 얻는 데 정말 도움돼요',
    timestamp: new Date('2025-08-09T23:33:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '17',
    userName: '문학청년',
    message: '소설 쓸 때 AI 쓰면 표절 아닌가요?',
    timestamp: new Date('2025-08-09T23:34:09'),
    userPosition: 'B입장',
    isSpeaker: false
  },
  {
    id: '18',
    userName: '개발자C',
    message: '코딩도 AI 도움 받는 시대인데 예술이라고 다를까요?',
    timestamp: new Date('2025-08-09T23:35:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '19',
    userName: '미술학도',
    message: '손으로 그려야 진짜 예술이죠',
    timestamp: new Date('2025-08-09T23:36:09'),
    userPosition: 'B입장',
    isSpeaker: false
  },
  {
    id: '20',
    userName: '정미경',
    message: 'AI는 결국 기존 작품들의 조합일 뿐이에요',
    timestamp: new Date('2025-08-09T23:37:09'),
    userPosition: 'B입장',
    isSpeaker: true
  },
  {
    id: '21',
    userName: '영화감독',
    message: '스토리텔링에서 AI가 어떤 역할을 할 수 있을까요?',
    timestamp: new Date('2025-08-09T23:38:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '22',
    userName: '관객D',
    message: '결과물이 좋으면 과정은 중요하지 않을 수도...',
    timestamp: new Date('2025-08-09T23:39:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '23',
    userName: '예술비평가',
    message: '창의성의 가치 기준이 바뀌고 있는 것 같아요',
    timestamp: new Date('2025-08-09T23:40:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '24',
    userName: '독립예술가',
    message: 'AI 없이도 충분히 창작할 수 있어요',
    timestamp: new Date('2025-08-09T23:41:09'),
    userPosition: 'B입장',
    isSpeaker: false
  },
  {
    id: '25',
    userName: '스타트업대표',
    message: 'AI 창작 도구로 누구나 예술가가 될 수 있어요',
    timestamp: new Date('2025-08-09T23:42:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '26',
    userName: '관찰자E',
    message: '토론이 정말 흥미진진하네요!',
    timestamp: new Date('2025-08-09T23:43:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '27',
    userName: '철학과생',
    message: '창의성이란 무엇인가부터 정의해야겠어요',
    timestamp: new Date('2025-08-09T23:44:09'),
    userPosition: 'B입장',
    isSpeaker: false
  },
  {
    id: '28',
    userName: '갤러리운영자',
    message: 'AI 작품 전시도 많이 늘어나고 있어요',
    timestamp: new Date('2025-08-09T23:45:09'),
    userPosition: 'A입장',
    isSpeaker: false
  },
  {
    id: '29',
    userName: '학부모',
    message: '우리 아이들은 어떤 창의성을 길러야 할까요?',
    timestamp: new Date('2025-08-09T23:46:09'),
    userPosition: 'B입장',
    isSpeaker: false
  },
  {
    id: '30',
    userName: '미래학자',
    message: 'AI와 인간의 협업이 새로운 창의성의 시작일 거예요',
    timestamp: new Date('2025-08-09T23:47:09'),
    userPosition: 'A입장',
    isSpeaker: false
  }
];