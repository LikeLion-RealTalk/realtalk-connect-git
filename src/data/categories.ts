import { DebateCategory } from "@/types/debate";

export const debateCategories: DebateCategory[] = [
  { id: 1, name: "연애", description: "소개팅, 연애 가치관, 남녀 심리" },
  { id: 2, name: "친구 & 인간관계", description: "우정, 갈등, 인간관계 매너" },
  { id: 3, name: "일상 & 라이프스타일", description: "루틴, 미니멀리즘, 자취, 다이어트" },
  { id: 4, name: "취업 & 진로", description: "이직, 진로 고민, 워라밸" },
  { id: 5, name: "밈 & 유행", description: "요즘 밈, 패션, 드립, 놀이 문화" },
  { id: 6, name: "SNS & 온라인 문화", description: "틱톡, 인스타, 댓글, 커뮤니티 문화" },
  { id: 7, name: "AI & 미래사회", description: "ChatGPT, 자동화, 윤리 문제" },
  { id: 8, name: "게임 & e스포츠", description: "게임 중독, 메타 논쟁, 게이머 문화" },
  { id: 9, name: "K-콘텐츠", description: "아이돌, 드라마, 예능, 팬 문화" },
  { id: 10, name: "논란 & 사회 이슈", description: "젠더, 정치 등 사회적 이슈" },
  { id: 11, name: "돈 & 소비문화", description: "소비 습관, 명품, 돈 가치관" },
  { id: 12, name: "자유 주제", description: "어느 범주에도 속하지 않음" }
];

export const getCategoryIcon = (categoryId: number): string => {
  const iconMap: Record<number, string> = {
    1: "💕", // 연애
    2: "👥", // 친구 & 인간관계
    3: "🏠", // 일상 & 라이프스타일
    4: "💼", // 취업 & 진로
    5: "🔥", // 밈 & 유행
    6: "📱", // SNS & 온라인 문화
    7: "🤖", // AI & 미래사회
    8: "🎮", // 게임 & e스포츠
    9: "🎭", // K-콘텐츠
    10: "⚖️", // 논란 & 사회 이슈
    11: "💰", // 돈 & 소비문화
    12: "💬"  // 자유 주제
  };
  return iconMap[categoryId] || "📝";
};