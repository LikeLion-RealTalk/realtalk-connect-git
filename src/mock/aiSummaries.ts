import { Position, POSITIONS } from '../types/discussion';

export interface AISummary {
  id: string;
  speakerName: string;
  position: Position;
  summary: string;
  timestamp: Date;
}

export const MOCK_AI_SUMMARIES: AISummary[] = [
  {
    id: '1',
    speakerName: '김민수',
    position: POSITIONS[0], // 'A입장'
    summary: 'AI는 창의성을 대체하지 않고 보완한다는 입장을 표명. AI 도구 활용으로 예술가들의 혁신성이 증가한다고 주장.',
    timestamp: new Date('2025-08-09T23:48:09')
  },
  {
    id: '2',
    speakerName: '이영희',
    position: POSITIONS[1], // 'B입장'
    summary: '인간 고유의 감정과 경험에서 나오는 진정한 창의성은 AI가 대체할 수 없다고 주장. 창의성의 본질적 가치 강조.',
    timestamp: new Date('2025-08-09T23:49:15')
  },
  {
    id: '3',
    speakerName: '박철수',
    position: POSITIONS[0], // 'A입장'
    summary: 'AI를 단순 보조 도구가 아닌 창작 파트너로 규정. 음악 작곡 분야의 성공 사례를 통해 실용성 입증.',
    timestamp: new Date('2025-08-09T23:50:22')
  },
  {
    id: '4',
    speakerName: '정미경',
    position: POSITIONS[1], // 'B입장'
    summary: 'AI는 기존 데이터의 재조합일 뿐이라고 비판. 무에서 유를 창조하는 진정한 창의성은 인간만의 고유 능력이라고 주장.',
    timestamp: new Date('2025-08-09T23:51:38')
  },
  {
    id: '5',
    speakerName: '김민수',
    position: POSITIONS[0], // 'A입장'
    summary: '인간의 창작 과정과 AI의 학습 과정 간 본질적 차이가 없다고 반박. 둘 다 과거 경험을 바탕으로 한다고 주장.',
    timestamp: new Date('2025-08-09T23:52:45')
  },
  {
    id: '6',
    speakerName: '김민수',
    position: POSITIONS[0], // 'A입장'
    summary: 'AI를 도구로 활용하되 인간 고유의 관점과 철학을 표현하는 것이 핵심이라고 결론. 청중들의 다양한 의견을 통해 확신을 얻었다고 표현.',
    timestamp: new Date('2025-08-09T23:54:20')
  }
];