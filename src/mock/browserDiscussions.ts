import { Discussion } from '../types/discussion';

export const MOCK_BROWSER_DISCUSSIONS: Discussion[] = [
  {
    id: '1',
    type: '3분토론',
    status: '진행중',
    title: 'AI 시대, 인간의 창의성은 여전히 중요할까?',
    category: '🤖AI & 미래사회',
    timeStatus: '45분 째 불타는 중',
    speakers: { current: 6, max: 8 },
    audience: { current: 45, max: 60 }
  },
  {
    id: '2',
    type: '일반토론',
    status: '진행중',
    title: '원격근무 vs 사무실 근무, 어떤 것이 더 효율적일까?',
    category: '💼취업 & 진로',
    timeStatus: '12분 째 진행중',
    speakers: { current: 4, max: 6 },
    audience: { current: 23, max: 40 }
  },
  {
    id: '3',
    type: '일반토론',
    status: '대기중',
    title: '환경보호를 위한 개인의 실천, 어디까지 해야 할까?',
    category: '⚖️논란 & 사회 이슈',
    timeStatus: '10분 후 시작',
    speakers: { current: 2, max: 8 },
    audience: { current: 15, max: 50 }
  },
  {
    id: '4',
    type: '3분토론',
    status: '진행중',
    title: '메타버스는 미래의 주류가 될 수 있을까?',
    category: '🤖AI & 미래사회',
    timeStatus: '23분 째 진행중',
    speakers: { current: 5, max: 6 },
    audience: { current: 38, max: 45 }
  },
  {
    id: '5',
    type: '일반토론',
    status: '종료됨',
    title: '온라인 교육 vs 오프라인 교육의 효과성',
    category: '⚖️논란 & 사회 이슈',
    timeStatus: '2시간 전 종료',
    speakers: { current: 8, max: 8 },
    audience: { current: 67, max: 80 }
  },
  {
    id: '6',
    type: '3분토론',
    status: '대기중',
    title: '디지털 아트와 전통 예술의 경계',
    category: '🎭K-콘텐츠',
    timeStatus: '30분 후 시작',
    speakers: { current: 3, max: 6 },
    audience: { current: 12, max: 40 }
  },
  {
    id: '7',
    type: '일반토론',
    status: '진행중',
    title: '소셜미디어가 청소년에게 미치는 영향',
    category: '📱SNS & 온라인 문화',
    timeStatus: '1시간 째 진행중',
    speakers: { current: 7, max: 8 },
    audience: { current: 52, max: 60 }
  },
  {
    id: '8',
    type: '3분토론',
    status: '진행중',
    title: '암호화폐의 미래와 경제적 파급효과',
    category: '💰돈 & 소비문화',
    timeStatus: '38분 째 진행중',
    speakers: { current: 6, max: 8 },
    audience: { current: 41, max: 50 }
  },
  {
    id: '9',
    type: '일반토론',
    status: '대기중',
    title: '기본소득 제도, 실현 가능할까?',
    category: '⚖️논란 & 사회 이슈',
    timeStatus: '1시간 후 시작',
    speakers: { current: 1, max: 8 },
    audience: { current: 8, max: 60 }
  },
  {
    id: 'discussion-1',
    type: '일반토론',
    status: '종료됨',
    title: '온라인 교육 vs 오프라인 교육, 어느 것이 더 효과적일까?',
    category: '💼취업 & 진로',
    timeStatus: '3시간 전 종료',
    speakers: { current: 8, max: 8 },
    audience: { current: 120, max: 120 }
  },
  {
    id: 'discussion-2',
    type: '3분토론',
    status: '종료됨',
    title: 'MZ세대의 워라밸, 현실적인가 이상적인가?',
    category: '💼취업 & 진로',
    timeStatus: '1일 전 종료',
    speakers: { current: 6, max: 6 },
    audience: { current: 85, max: 100 }
  },
  {
    id: 'discussion-3',
    type: '일반토론',
    status: '종료됨',
    title: 'AI가 인간의 창의성을 대체할 수 있을까?',
    category: '🤖AI & 미래사회',
    timeStatus: '2일 전 종료',
    speakers: { current: 8, max: 8 },
    audience: { current: 95, max: 100 }
  },
  {
    id: 'discussion-4',
    type: '일반토론',
    status: '종료됨',
    title: 'K-콘텐츠의 해외 진출, 지속가능할까?',
    category: '🎭K-콘텐츠',
    timeStatus: '3일 전 종료',
    speakers: { current: 8, max: 8 },
    audience: { current: 150, max: 150 }
  }
];