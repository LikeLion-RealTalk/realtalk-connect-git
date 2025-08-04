import { Debate } from "@/types/debate";

export const extendedMockDebates: Debate[] = [
  {
    id: '1',
    title: 'AI의 미래: 인간을 대체할 것인가?',
    category: 'AI & 미래사회',
    type: 'normal',
    status: 'active',
    duration: 45,
    participants: { current: 6, max: 8 },
    audience: { current: 45, max: 60 },
    icon: '🤖',
    description: '인공지능 기술의 발전이 인간의 직업과 사회에 미치는 영향에 대해 토론합니다.',
    date: '2024. 1. 15.'
  },
  {
    id: '2', 
    title: '기후변화 대응: 개인 vs 기업 책임',
    category: '논란 & 사회 이슈',
    type: 'quick',
    status: 'active',
    duration: 30,
    participants: { current: 4, max: 6 },
    audience: { current: 20, max: 40 },
    icon: '🌍',
    description: '기후변화 해결을 위한 개인의 노력과 기업의 역할 중 어느 것이 더 중요한지 논의합니다.',
    date: '2024. 1. 14.'
  },
  {
    id: '3',
    title: '원격근무 vs 오프라인 근무',
    category: '취업 & 진로',
    type: 'normal',
    status: 'waiting',
    duration: 0,
    participants: { current: 2, max: 4 },
    audience: { current: 0, max: 0 },
    icon: '💼',
    description: '코로나19 이후 변화된 근무 환경에서 어떤 방식이 더 효율적인지 토론합니다.',
    date: '2024. 1. 13.'
  },
  {
    id: '4',
    title: '교육 시스템의 변화 필요성',
    category: '논란 & 사회 이슈',
    type: 'quick',
    status: 'ended',
    duration: 120,
    participants: { current: 8, max: 8 },
    audience: { current: 80, max: 80 },
    icon: '🎓',
    description: '현재 교육 시스템의 문제점과 개선 방향에 대한 다양한 의견을 나눕니다.',
    date: '2024. 1. 12.'
  },
  {
    id: '5',
    title: '디지털 미니멀리즘의 필요성',
    category: 'SNS & 온라인 문화',
    type: 'normal',
    status: 'active',
    duration: 45,
    participants: { current: 4, max: 6 },
    audience: { current: 25, max: 60 },
    icon: '📱',
    description: '스마트폰과 SNS 과의존 시대, 디지털 디톡스의 효과에 대해 논의합니다.',
    date: '2024. 1. 14.'
  },
  {
    id: '6',
    title: '전기차 vs 하이브리드차',
    category: 'AI & 미래사회',
    type: 'quick',
    status: 'active',
    duration: 45,
    participants: { current: 6, max: 8 },
    audience: { current: 40, max: 80 },
    icon: '🚗',
    description: '친환경 자동차의 미래, 전기차와 하이브리드차 중 어느 것이 더 현실적인지 토론합니다.',
    date: '2024. 1. 13.'
  }
];

export type ExtendedDebate = Debate;