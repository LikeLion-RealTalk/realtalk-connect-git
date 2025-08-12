import { DebateSummary } from '../types/discussion';

export const MOCK_DEBATE_SUMMARIES: DebateSummary[] = [
  {
    id: 'summary-1',
    discussionId: 'discussion-1',
    debateType: '일반토론',
    title: '온라인 교육 vs 오프라인 교육, 어느 것이 더 효과적일까?',
    category: '💼취업 & 진로',
    duration: 45,
    participantCount: 120,
    keyStatements: {
      aSide: [
        '장소 제약 없이 다양한 학습 기회 제공',
        '개인 맞춤형 학습 속도 조절 가능',
        '반복 학습과 녹화 자료 활용 가능'
      ],
      bSide: [
        '집중도와 몰입감은 대면 환경이 더 높다',
        '즉석 질의응답과 토론의 깊이가 다르다',
        '네트워킹과 인간관계 형성 측면에서 유리'
      ]
    },
    publicOpinion: {
      totalVotes: 120,
      aPercentage: 58,
      bPercentage: 42
    },
    finalConclusion: '온라인은 접근성을, 오프라인은 몰입감을 살려 혼합형 교육이 최적의 대안이다.',
    summary: '온라인 교육과 오프라인 교육 각각의 장단점이 명확히 드러난 토론이었습니다. 온라인 교육 지지자들은 접근성과 개인화된 학습의 장점을 강조했고, 오프라인 교육 지지자들은 집중도와 상호작용의 중요성을 부각시켰습니다.',
    completedAt: new Date('2024-01-15T14:30:00')
  },
  {
    id: 'summary-2', 
    discussionId: 'discussion-2',
    debateType: '3분토론',
    title: 'MZ세대의 워라밸, 현실적인가 이상적인가?',
    category: '💼취업 & 진로',
    duration: 3,
    participantCount: 85,
    keyStatements: {
      aSide: [
        '삶의 질 향상이 생산성 증대로 이어진다',
        '번아웃 방지로 장기적 커리어에 도움',
        '개인의 행복추구권은 당연한 권리'
      ],
      bSide: [
        '치열한 경쟁 사회에서 현실성이 부족하다',
        '초기 커리어에는 집중적 투자가 필요',
        '워라밸보다 워라하모니가 더 현실적'
      ]
    },
    publicOpinion: {
      totalVotes: 85,
      aPercentage: 65,
      bPercentage: 35
    },
    finalConclusion: 'MZ세대의 워라밸은 이상적 가치이지만, 단계적 접근이 현실적 대안이다.',
    summary: '짧은 시간 동안 진행된 3분토론임에도 불구하고, 워라밸에 대한 다양한 관점이 제시되었습니다. 많은 참여자들이 워라밸의 중요성을 인정하면서도 현실적 제약을 고려한 단계적 접근의 필요성에 공감했습니다.',
    completedAt: new Date('2024-01-14T16:45:00')
  },
  {
    id: 'summary-3',
    discussionId: 'discussion-3', 
    debateType: '일반토론',
    title: 'AI가 인간의 창의성을 대체할 수 있을까?',
    category: '🤖AI & 미래사회',
    duration: 60,
    participantCount: 95,
    keyStatements: {
      aSide: [
        'AI는 이미 음악, 미술 등에서 창의적 결과물 생산',
        '패턴 분석을 통한 새로운 조합 창출 가능',
        '인간보다 빠르고 대량의 창작물 생성 가능'
      ],
      bSide: [
        '진정한 창의성은 감정과 경험에서 나온다',
        'AI는 기존 데이터 조합일 뿐 진짜 창조는 아니다',
        '인간의 직관과 상상력은 대체 불가능'
      ]
    },
    publicOpinion: {
      totalVotes: 95,
      aPercentage: 42,
      bPercentage: 58
    },
    finalConclusion: 'AI는 창의적 도구로서 인간을 보완하는 역할이 적합하며, 완전한 대체보다는 협업이 미래의 방향이다.',
    summary: 'AI 창의성에 대한 철학적이고 기술적인 논의가 활발히 이뤄졌습니다. 참여자들은 AI의 기술적 능력을 인정하면서도, 인간의 고유한 창의성 영역에 대해서는 보수적인 입장을 보였습니다.',
    completedAt: new Date('2024-01-13T19:20:00')
  },
  {
    id: 'summary-4',
    discussionId: 'discussion-4',
    debateType: '일반토론', 
    title: 'K-콘텐츠의 해외 진출, 지속가능할까?',
    category: '🎭K-콘텐츠',
    duration: 50,
    participantCount: 150,
    keyStatements: {
      aSide: [
        '한류의 지속적 확산과 팬덤 문화의 견고함',
        '넷플릭스 등 글로벌 플랫폼과의 협력 확대',
        '다양한 장르로의 확장 가능성'
      ],
      bSide: [
        '트렌드의 일시적 현상일 가능성',
        '현지화 없는 일방적 수출의 한계',
        '글로벌 경쟁 심화로 인한 포화 우려'
      ]
    },
    publicOpinion: {
      totalVotes: 150,
      aPercentage: 72,
      bPercentage: 28
    },
    finalConclusion: 'K-콘텐츠의 지속가능성을 위해서는 글로벌 트렌드 분석과 현지화 전략이 핵심이다.',
    summary: 'K-콘텐츠의 미래에 대한 낙관적 전망이 우세했지만, 지속가능성을 위한 전략적 접근의 필요성도 함께 제기되었습니다. 참여자들은 단순한 수출을 넘어선 문화적 교류의 중요성을 강조했습니다.',
    completedAt: new Date('2024-01-12T21:15:00')
  },
  {
    id: 'summary-5',
    discussionId: '5',
    debateType: '일반토론',
    title: '온라인 교육 vs 오프라인 교육의 효과성',
    category: '⚖️논란 & 사회 이슈',
    duration: 75,
    participantCount: 67,
    keyStatements: {
      aSide: [
        '시공간 제약 없이 자유로운 학습 환경 제공',
        '개인별 학습 속도에 맞춘 맞춤형 교육 가능',
        '다양한 멀티미디어 자료 활용으로 이해도 향상'
      ],
      bSide: [
        '직접적인 상호작용을 통한 깊이 있는 학습',
        '집중력과 학습 동기 유지에 더 효과적',
        '실습과 토론 중심의 체험형 학습 우수성'
      ]
    },
    publicOpinion: {
      totalVotes: 67,
      aPercentage: 45,
      bPercentage: 55
    },
    finalConclusion: '온라인과 오프라인 교육의 장점을 결합한 블렌디드 러닝이 미래 교육의 최적 모델이다.',
    summary: '코로나19 이후 교육 패러다임 변화를 배경으로 진행된 토론에서, 참여자들은 각 교육 방식의 고유한 장점을 인정하면서도 통합적 접근의 필요성에 공감했습니다. 특히 학습자의 특성과 교육 내용에 따른 유연한 적용이 중요하다는 의견이 많았습니다.',
    completedAt: new Date('2025-08-11T16:45:00')
  }
];

// 토론 ID로 요약 찾기
export const getDebateSummaryByDiscussionId = (discussionId: string): DebateSummary | null => {
  return MOCK_DEBATE_SUMMARIES.find(summary => summary.discussionId === discussionId) || null;
};

// 모든 요약 가져오기
export const getAllDebateSummaries = (): DebateSummary[] => {
  return MOCK_DEBATE_SUMMARIES;
};