import { Debate } from "@/types/debate";

export const mockDebates: Debate[] = [
  {
    id: '1',
    title: 'AI 시대, 인간의 창의성은 여전히 중요할까?',
    category: 'AI & 미래사회',
    type: 'normal',
    status: 'active',
    duration: 45,
    participants: { current: 6, max: 8 },
    audience: { current: 45, max: 60 },
    icon: '⏰'
  },
  {
    id: '2',
    title: '원격근무 의무화, 찬성 vs 반대',
    category: '취업 & 진로',
    type: 'quick',
    status: 'waiting',
    duration: 0,
    participants: { current: 2, max: 4 },
    audience: { current: 0, max: 0 },
    icon: '💼'
  },
  {
    id: '3',
    title: '기본소득제도 도입, 현실적일까?',
    category: '논란 & 사회 이슈',
    type: 'normal',
    status: 'active',
    duration: 65,
    participants: { current: 10, max: 10 },
    audience: { current: 100, max: 100 },
    icon: '🏛️'
  },
  {
    id: '4',
    title: 'Z세대의 소비 패턴, 어떻게 볼 것인가?',
    category: '돈 & 소비문화',
    type: 'quick',
    status: 'waiting',
    duration: 0,
    participants: { current: 4, max: 6 },
    audience: { current: 15, max: 20 },
    icon: '🛍️'
  }
];