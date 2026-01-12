/**
 * Korean Middle School Math Curriculum Seed Data
 * Based on: 2022 개정 교육과정
 *
 * Sources:
 * - 교육부 2022 개정 수학과 교육과정
 * - 오르비 수학 게시판 (tutor insights)
 * - 김과외/숨고 튜터 커뮤니티
 */

import type { CurriculumSeedData } from '../loaders/types';

export const KR_MATH_MIDDLE: CurriculumSeedData = {
  meta: {
    curriculumId: 'kr-2022',
    country: 'KR',
    subject: 'MATH',
    version: '2022',
    lastUpdated: '2024-12-01',
    source: '2022 개정 교육과정 + 튜터 커뮤니티',
  },

  topics: [
    // ============================================
    // 초등 6학년 (선수학습 기준점)
    // ============================================
    {
      code: 'FRACTION-OPS',
      name: '분수의 사칙연산',
      nameEn: 'Fraction Operations',
      grade: 'ELEMENTARY_6',
      chapter: '1. 분수의 나눗셈',
      hours: 12,
      difficulty: 3,
      objectives: [
        '분수의 덧셈, 뺄셈, 곱셈, 나눗셈 계산',
        '분모가 다른 분수의 연산 이해',
      ],
      keyTerms: ['분수', '약분', '통분', '대분수', '가분수'],
      struggles: [
        {
          description: '통분 개념 부족',
          frequency: 'VERY_COMMON',
          symptom: '분모가 다른 분수 덧셈에서 분자만 더함',
          rootCause: '왜 분모를 같게 해야 하는지 이해 못함',
          remediation: '피자 그림으로 조각 크기가 달라야 합칠 수 없음을 시각화',
        },
        {
          description: '분수 나눗셈에서 역수 곱셈 혼동',
          frequency: 'COMMON',
          symptom: '÷ 를 × 로 바꾸지 않고 역수만 취함',
          remediation: '"나누기는 뒤집어서 곱하기" 구호 반복',
        },
      ],
      tips: [
        {
          tip: '분수 연산은 "피자 나누기"로 시작하면 직관적으로 이해됨',
          source: 'orbi',
        },
      ],
    },
    {
      code: 'RATIO-RATE',
      name: '비와 비율',
      nameEn: 'Ratio and Rate',
      grade: 'ELEMENTARY_6',
      chapter: '4. 비와 비율',
      hours: 8,
      difficulty: 3,
      objectives: ['비의 개념 이해', '비율과 백분율 계산', '비례식 활용'],
      keyTerms: ['비', '비율', '백분율', '비례식', '비례배분'],
      prerequisites: [{ code: 'FRACTION-OPS', strength: 'REQUIRED' }],
      struggles: [
        {
          description: '비와 분수의 관계 혼동',
          frequency: 'COMMON',
          symptom: '3:4를 3/4로만 이해하고 비의 의미 놓침',
          rootCause: '비는 "비교"인데 분수 계산에만 집중',
        },
      ],
    },
    {
      code: 'DECIMAL-OPS',
      name: '소수의 사칙연산',
      nameEn: 'Decimal Operations',
      grade: 'ELEMENTARY_6',
      chapter: '2. 소수의 나눗셈',
      hours: 10,
      difficulty: 2,
      objectives: ['소수의 덧셈, 뺄셈, 곱셈, 나눗셈 계산', '소수점 위치 이해'],
      keyTerms: ['소수', '소수점', '자릿값'],
      struggles: [
        {
          description: '소수점 위치 착오',
          frequency: 'VERY_COMMON',
          symptom: '곱셈 결과에서 소수점 위치 잘못 찍음',
          remediation: '소수점 아래 자릿수 세기 규칙 명확히',
        },
      ],
    },

    // ============================================
    // 중학교 1학년
    // ============================================
    {
      code: 'INTEGERS',
      name: '정수와 유리수',
      nameEn: 'Integers and Rational Numbers',
      grade: 'MIDDLE_1',
      chapter: '1. 정수와 유리수',
      order: 1,
      hours: 14,
      difficulty: 3,
      description: '음수 개념의 첫 등장. 수의 체계 확장.',
      objectives: [
        '양수와 음수 개념 이해',
        '정수와 유리수의 사칙연산',
        '수직선에서 수의 위치',
      ],
      keyTerms: ['정수', '유리수', '양수', '음수', '절댓값', '수직선'],
      prerequisites: [
        { code: 'FRACTION-OPS', strength: 'REQUIRED', reason: '유리수는 분수 형태로 표현됨' },
        { code: 'DECIMAL-OPS', strength: 'REQUIRED' },
      ],
      struggles: [
        {
          description: '음수 × 음수 = 양수 이해 불가',
          frequency: 'VERY_COMMON',
          symptom: '(-3) × (-2) = -6 으로 계산',
          rootCause: '마이너스가 "빼기"라는 초등 개념에서 벗어나지 못함',
          remediation: '빚 × 빚 = 이득 비유, 또는 방향 반전 개념 설명',
        },
        {
          description: '절댓값 기호 안의 연산 순서 혼동',
          frequency: 'COMMON',
          symptom: '|-3 + 5| 를 |-3| + |5| 로 계산',
          remediation: '절댓값은 "거리"임을 강조, 안쪽 먼저 계산',
        },
      ],
      tips: [
        {
          tip: '온도계로 음수 개념 도입하면 직관적',
          source: 'gamsagyo',
        },
        {
          tip: '(-) × (-) 는 "적의 적은 아군" 비유가 중학생에게 먹힘',
          source: 'orbi',
        },
      ],
      diagnostics: [
        {
          question: '(-5) + (-3) = ?',
          answer: '-8',
          wrongPatterns: [
            {
              pattern: '-2',
              indicatesGap: 'INTEGERS',
              explanation: '덧셈을 뺄셈으로 착각',
            },
            {
              pattern: '8',
              indicatesGap: 'INTEGERS',
              explanation: '부호 무시',
            },
          ],
        },
        {
          question: '(-4) × 3 = ?',
          answer: '-12',
          wrongPatterns: [
            {
              pattern: '12',
              indicatesGap: 'INTEGERS',
              explanation: '부호 규칙 미숙',
            },
          ],
        },
      ],
    },
    {
      code: 'LETTERS-EXPRESSIONS',
      name: '문자와 식',
      nameEn: 'Variables and Expressions',
      grade: 'MIDDLE_1',
      chapter: '2. 문자와 식',
      order: 2,
      hours: 12,
      difficulty: 3,
      description: '대수학의 시작. x, y 변수 개념 도입.',
      objectives: [
        '문자를 사용한 식의 표현',
        '다항식의 덧셈과 뺄셈',
        '등식과 부등식의 성질',
      ],
      keyTerms: ['변수', '상수', '항', '계수', '다항식', '동류항'],
      prerequisites: [
        { code: 'INTEGERS', strength: 'REQUIRED', reason: '음수 계수 이해 필요' },
      ],
      struggles: [
        {
          description: '문자를 "모르는 수"로만 인식',
          frequency: 'VERY_COMMON',
          symptom: 'x + x = x² 로 계산',
          rootCause: '문자를 구체적 숫자로 대입해본 경험 부족',
          remediation: 'x = 3 대입해서 확인하는 습관 들이기',
        },
        {
          description: '동류항 개념 미숙',
          frequency: 'COMMON',
          symptom: '2x + 3y = 5xy 로 합침',
          remediation: '"사과 2개 + 배 3개 = 과일 5개" 비유',
        },
      ],
      tips: [
        {
          tip: '문자식은 "상자 안의 숫자" 비유로 시작',
          source: 'orbi',
        },
      ],
    },
    {
      code: 'LINEAR-EQ-1VAR',
      name: '일차방정식',
      nameEn: 'Linear Equations in One Variable',
      grade: 'MIDDLE_1',
      chapter: '3. 일차방정식',
      order: 3,
      hours: 10,
      difficulty: 3,
      objectives: ['방정식의 뜻', '등식의 성질', '일차방정식 풀이', '활용 문제'],
      keyTerms: ['방정식', '미지수', '해', '등식의 성질', '이항'],
      prerequisites: [
        { code: 'LETTERS-EXPRESSIONS', strength: 'REQUIRED' },
        { code: 'INTEGERS', strength: 'REQUIRED' },
      ],
      struggles: [
        {
          description: '이항 시 부호 바꾸기 오류',
          frequency: 'VERY_COMMON',
          symptom: 'x + 3 = 5 → x = 5 + 3 으로 이항',
          rootCause: '등식의 성질(양변에 같은 연산)을 이해 못함',
          remediation: '저울 비유: 양쪽에 똑같이 빼야 균형 유지',
        },
        {
          description: '활용 문제 식 세우기 어려움',
          frequency: 'COMMON',
          rootCause: '문장을 수식으로 번역하는 연습 부족',
          remediation: '문장 → 표 → 식 순서로 정리하는 훈련',
        },
      ],
      diagnostics: [
        {
          question: '2x - 4 = 10 을 풀어라',
          answer: 'x = 7',
          wrongPatterns: [
            {
              pattern: 'x = 3',
              indicatesGap: 'LINEAR-EQ-1VAR',
              explanation: '이항 시 부호 오류',
            },
          ],
        },
      ],
    },
    {
      code: 'COORDINATES',
      name: '좌표평면과 그래프',
      nameEn: 'Coordinate Plane and Graphs',
      grade: 'MIDDLE_1',
      chapter: '4. 좌표평면',
      order: 4,
      hours: 8,
      difficulty: 2,
      objectives: ['순서쌍과 좌표', '좌표평면 이해', '사분면', '정비례/반비례 그래프'],
      keyTerms: ['좌표', '순서쌍', 'x축', 'y축', '원점', '사분면'],
      prerequisites: [{ code: 'INTEGERS', strength: 'REQUIRED' }],
      struggles: [
        {
          description: 'x, y 순서 혼동',
          frequency: 'COMMON',
          symptom: '(3, 5) 점을 y=3, x=5로 찍음',
          remediation: '"가로 먼저, 세로 나중" 구호',
        },
      ],
    },
    {
      code: 'BASIC-GEOMETRY',
      name: '기본 도형',
      nameEn: 'Basic Geometry',
      grade: 'MIDDLE_1',
      chapter: '5. 기본 도형',
      order: 5,
      hours: 10,
      difficulty: 2,
      objectives: ['점, 선, 면 개념', '각의 측정', '위치 관계', '작도'],
      keyTerms: ['직선', '반직선', '선분', '평행', '수직', '작도'],
    },
    {
      code: 'PLANE-FIGURES',
      name: '평면도형의 성질',
      nameEn: 'Properties of Plane Figures',
      grade: 'MIDDLE_1',
      chapter: '6. 평면도형',
      order: 6,
      hours: 12,
      difficulty: 3,
      objectives: ['다각형의 내각/외각', '원과 부채꼴'],
      keyTerms: ['내각', '외각', '대각선', '부채꼴', '호', '현'],
      prerequisites: [{ code: 'BASIC-GEOMETRY', strength: 'REQUIRED' }],
    },
    {
      code: 'SOLID-FIGURES',
      name: '입체도형',
      nameEn: 'Solid Figures',
      grade: 'MIDDLE_1',
      chapter: '7. 입체도형',
      order: 7,
      hours: 10,
      difficulty: 3,
      objectives: ['다면체와 회전체', '겉넓이와 부피'],
      keyTerms: ['다면체', '각기둥', '각뿔', '회전체', '원기둥', '원뿔'],
      prerequisites: [{ code: 'PLANE-FIGURES', strength: 'RECOMMENDED' }],
    },
    {
      code: 'STATISTICS-1',
      name: '자료의 정리와 해석',
      nameEn: 'Data Organization and Interpretation',
      grade: 'MIDDLE_1',
      chapter: '8. 통계',
      order: 8,
      hours: 8,
      difficulty: 2,
      objectives: ['도수분포표', '히스토그램', '도수분포다각형', '상대도수'],
      keyTerms: ['도수', '계급', '도수분포표', '히스토그램', '상대도수'],
    },

    // ============================================
    // 중학교 2학년
    // ============================================
    {
      code: 'EXPONENTS',
      name: '지수법칙',
      nameEn: 'Laws of Exponents',
      grade: 'MIDDLE_2',
      chapter: '1. 유리수와 순환소수',
      order: 1,
      hours: 8,
      difficulty: 3,
      objectives: ['지수의 뜻', '지수법칙'],
      keyTerms: ['지수', '밑', '거듭제곱'],
      prerequisites: [{ code: 'INTEGERS', strength: 'REQUIRED' }],
      struggles: [
        {
          description: '지수 덧셈과 곱셈 규칙 혼동',
          frequency: 'VERY_COMMON',
          symptom: 'a² × a³ = a⁶ 으로 계산',
          rootCause: '지수끼리 곱해야 하는지 더해야 하는지 헷갈림',
          remediation: '직접 풀어쓰기: a²×a³ = (a×a)×(a×a×a) = a⁵',
        },
      ],
    },
    {
      code: 'POLYNOMIALS',
      name: '다항식의 계산',
      nameEn: 'Polynomial Operations',
      grade: 'MIDDLE_2',
      chapter: '2. 식의 계산',
      order: 2,
      hours: 12,
      difficulty: 3,
      objectives: ['단항식의 곱셈과 나눗셈', '다항식의 덧셈과 뺄셈', '다항식과 단항식의 곱셈/나눗셈'],
      keyTerms: ['단항식', '다항식', '차수'],
      prerequisites: [
        { code: 'LETTERS-EXPRESSIONS', strength: 'REQUIRED' },
        { code: 'EXPONENTS', strength: 'REQUIRED' },
      ],
      struggles: [
        {
          description: '분배법칙 적용 오류',
          frequency: 'COMMON',
          symptom: '2(x + 3) = 2x + 3 으로 계산',
          rootCause: '분배법칙 적용 범위 이해 부족',
        },
      ],
    },
    {
      code: 'LINEAR-EQ-2VAR',
      name: '연립방정식',
      nameEn: 'System of Linear Equations',
      grade: 'MIDDLE_2',
      chapter: '3. 연립방정식',
      order: 3,
      hours: 14,
      difficulty: 4,
      description: '두 미지수, 두 방정식의 해 구하기',
      objectives: ['연립방정식의 뜻', '대입법', '가감법', '활용 문제'],
      keyTerms: ['연립방정식', '대입법', '가감법'],
      prerequisites: [
        { code: 'LINEAR-EQ-1VAR', strength: 'REQUIRED', reason: '일차방정식 풀이가 기본' },
        { code: 'POLYNOMIALS', strength: 'REQUIRED' },
      ],
      struggles: [
        {
          description: '어떤 방법(대입/가감)을 써야 할지 판단 못함',
          frequency: 'COMMON',
          symptom: '무조건 대입법만 시도',
          remediation: '계수 비교 → 가감법 유리 / 이미 정리된 식 → 대입법',
        },
        {
          description: '가감법에서 부호 처리 오류',
          frequency: 'VERY_COMMON',
          symptom: '빼기할 때 뒷 식 전체 부호 안 바꿈',
          remediation: '빼기 = 뒤집어서 더하기, 괄호로 묶어 연습',
        },
      ],
      diagnostics: [
        {
          question: 'x + y = 5, x - y = 1 의 해를 구하라',
          answer: 'x = 3, y = 2',
          wrongPatterns: [
            {
              pattern: 'x = 2, y = 3',
              indicatesGap: 'LINEAR-EQ-2VAR',
              explanation: 'x, y 값 뒤바뀜 - 대입 확인 안 함',
            },
          ],
        },
      ],
    },
    {
      code: 'INEQUALITIES',
      name: '부등식',
      nameEn: 'Inequalities',
      grade: 'MIDDLE_2',
      chapter: '4. 부등식',
      order: 4,
      hours: 10,
      difficulty: 3,
      objectives: ['부등식의 성질', '일차부등식 풀이', '연립부등식'],
      keyTerms: ['부등호', '부등식', '해집합'],
      prerequisites: [
        { code: 'LINEAR-EQ-1VAR', strength: 'REQUIRED' },
        { code: 'INTEGERS', strength: 'REQUIRED' },
      ],
      struggles: [
        {
          description: '음수 곱할 때 부등호 방향 안 바꿈',
          frequency: 'VERY_COMMON',
          symptom: '-2x > 4 → x > -2 로 풀이',
          rootCause: '음수 곱하면 대소 관계 반전 이해 못함',
          remediation: '숫자 대입으로 직접 확인: -2 × (?)>4',
        },
      ],
    },
    {
      code: 'LINEAR-FUNCTIONS',
      name: '일차함수',
      nameEn: 'Linear Functions',
      grade: 'MIDDLE_2',
      chapter: '5. 일차함수',
      order: 5,
      hours: 16,
      difficulty: 4,
      description: '함수 개념의 첫 체계적 도입',
      objectives: [
        '함수의 개념',
        'y = ax + b 그래프',
        '기울기와 y절편',
        '일차함수와 일차방정식의 관계',
      ],
      keyTerms: ['함수', '정의역', '치역', '기울기', 'y절편', 'x절편'],
      prerequisites: [
        { code: 'COORDINATES', strength: 'REQUIRED', reason: '좌표평면에 그래프 그려야 함' },
        { code: 'LINEAR-EQ-1VAR', strength: 'REQUIRED' },
      ],
      struggles: [
        {
          description: '기울기 개념 혼동',
          frequency: 'VERY_COMMON',
          symptom: '기울기를 y좌표 변화량으로만 이해',
          rootCause: '기울기 = y변화/x변화 비율 이해 부족',
          remediation: '계단 비유: "가로 1칸 갈 때 세로 몇 칸?"',
        },
        {
          description: '그래프에서 식 유도 어려움',
          frequency: 'COMMON',
          symptom: '두 점이 주어졌을 때 식을 못 구함',
          remediation: '기울기 먼저 → 한 점 대입 → b 구하기 순서 명확히',
        },
      ],
      tips: [
        {
          tip: '일차함수 그래프는 "스키장 슬로프" 비유가 효과적',
          source: 'orbi',
        },
      ],
    },
    {
      code: 'TRIANGLE-PROPERTIES',
      name: '삼각형의 성질',
      nameEn: 'Properties of Triangles',
      grade: 'MIDDLE_2',
      chapter: '6. 삼각형의 성질',
      order: 6,
      hours: 12,
      difficulty: 3,
      objectives: ['이등변삼각형', '직각삼각형', '삼각형의 외심과 내심'],
      keyTerms: ['이등변삼각형', '외심', '내심', '합동'],
      prerequisites: [{ code: 'BASIC-GEOMETRY', strength: 'REQUIRED' }],
    },
    {
      code: 'QUADRILATERAL-PROPERTIES',
      name: '사각형의 성질',
      nameEn: 'Properties of Quadrilaterals',
      grade: 'MIDDLE_2',
      chapter: '7. 사각형의 성질',
      order: 7,
      hours: 10,
      difficulty: 3,
      objectives: ['평행사변형', '여러 가지 사각형의 성질'],
      keyTerms: ['평행사변형', '직사각형', '마름모', '정사각형', '사다리꼴'],
      prerequisites: [
        { code: 'TRIANGLE-PROPERTIES', strength: 'RECOMMENDED' },
        { code: 'PLANE-FIGURES', strength: 'REQUIRED' },
      ],
    },
    {
      code: 'SIMILARITY',
      name: '도형의 닮음',
      nameEn: 'Similarity',
      grade: 'MIDDLE_2',
      chapter: '8. 도형의 닮음',
      order: 8,
      hours: 12,
      difficulty: 4,
      objectives: ['닮음의 뜻', '닮음비', '삼각형 닮음 조건', '닮음 활용'],
      keyTerms: ['닮음', '닮음비', 'AA닮음', 'SAS닮음', 'SSS닮음'],
      prerequisites: [
        { code: 'TRIANGLE-PROPERTIES', strength: 'REQUIRED' },
        { code: 'RATIO-RATE', strength: 'REQUIRED', reason: '닮음비는 비율 개념 필요' },
      ],
      struggles: [
        {
          description: '대응하는 변/각 찾기 어려움',
          frequency: 'COMMON',
          symptom: '닮음비를 잘못된 변 쌍으로 계산',
          remediation: '그림에 대응점 표시, 이름 규칙 정하기',
        },
      ],
    },
    {
      code: 'PROBABILITY',
      name: '확률',
      nameEn: 'Probability',
      grade: 'MIDDLE_2',
      chapter: '9. 확률',
      order: 9,
      hours: 10,
      difficulty: 3,
      objectives: ['경우의 수', '확률의 뜻', '확률의 계산'],
      keyTerms: ['경우의 수', '사건', '확률', '여사건'],
      struggles: [
        {
          description: '"적어도" 문제 처리 어려움',
          frequency: 'COMMON',
          symptom: '"적어도 1개" 를 직접 세려 함',
          remediation: '여사건 활용: 1 - P(0개)',
        },
      ],
    },

    // ============================================
    // 중학교 3학년
    // ============================================
    {
      code: 'SQUARE-ROOTS',
      name: '제곱근과 실수',
      nameEn: 'Square Roots and Real Numbers',
      grade: 'MIDDLE_3',
      chapter: '1. 제곱근과 실수',
      order: 1,
      hours: 12,
      difficulty: 4,
      description: '무리수 개념 도입, 수 체계의 완성',
      objectives: ['제곱근의 뜻', '무리수와 실수', '제곱근의 성질', '실수의 대소 관계'],
      keyTerms: ['제곱근', '무리수', '실수', '근호'],
      prerequisites: [
        { code: 'EXPONENTS', strength: 'REQUIRED' },
        { code: 'INTEGERS', strength: 'REQUIRED' },
      ],
      struggles: [
        {
          description: '√4 = ±2 로 오해',
          frequency: 'VERY_COMMON',
          symptom: '√4 = ±2 답변',
          rootCause: 'x² = 4 의 해와 √4 혼동',
          remediation: '√ 는 양의 제곱근만! x² = 4 해는 ±2',
        },
        {
          description: '무리수 개념 이해 불가',
          frequency: 'COMMON',
          symptom: '√2 = 1.41 끝이라고 생각',
          remediation: '순환하지 않는 무한소수 증명 보여주기',
        },
      ],
    },
    {
      code: 'FACTORIZATION',
      name: '인수분해',
      nameEn: 'Factorization',
      grade: 'MIDDLE_3',
      chapter: '2. 다항식의 곱셈과 인수분해',
      order: 2,
      hours: 16,
      difficulty: 4,
      description: '다항식을 곱의 형태로 바꾸는 핵심 기술',
      objectives: [
        '곱셈 공식',
        '인수분해 공식',
        '복잡한 식의 인수분해',
      ],
      keyTerms: ['인수', '인수분해', '완전제곱식', '합차공식'],
      prerequisites: [
        { code: 'POLYNOMIALS', strength: 'REQUIRED' },
        { code: 'EXPONENTS', strength: 'REQUIRED' },
      ],
      struggles: [
        {
          description: '어떤 공식을 적용할지 판단 못함',
          frequency: 'VERY_COMMON',
          symptom: 'x² + 5x + 6 에서 무작정 공식 대입 시도',
          rootCause: '식의 형태 분석 능력 부족',
          remediation: '패턴 인식 훈련: 항 개수, 부호, 계수 체크 순서',
        },
        {
          description: '공통인수 빼기 누락',
          frequency: 'COMMON',
          symptom: '2x² + 4x 에서 바로 공식 찾음',
          remediation: '항상 공통인수 먼저 확인하는 습관',
        },
      ],
      tips: [
        {
          tip: '인수분해는 "곱셈 공식 거꾸로" - 전개 연습 먼저 충분히',
          source: 'orbi',
        },
      ],
    },
    {
      code: 'QUADRATIC-EQ',
      name: '이차방정식',
      nameEn: 'Quadratic Equations',
      grade: 'MIDDLE_3',
      chapter: '3. 이차방정식',
      order: 3,
      hours: 14,
      difficulty: 4,
      objectives: [
        '이차방정식의 뜻',
        '인수분해를 이용한 풀이',
        '완전제곱식을 이용한 풀이',
        '근의 공식',
      ],
      keyTerms: ['이차방정식', '근', '중근', '판별식', '근의 공식'],
      prerequisites: [
        { code: 'FACTORIZATION', strength: 'REQUIRED', reason: '인수분해로 푸는 게 기본' },
        { code: 'SQUARE-ROOTS', strength: 'REQUIRED', reason: '근의 공식에 제곱근 필요' },
      ],
      struggles: [
        {
          description: '근의 공식 암기/적용 오류',
          frequency: 'COMMON',
          symptom: '공식에서 부호 또는 2a 빠뜨림',
          remediation: '공식 유도 과정 한 번 같이 해보기',
        },
        {
          description: 'ax² + bx + c = 0 형태로 정리 안 함',
          frequency: 'COMMON',
          symptom: 'x² = 2x + 3 상태로 근의 공식 적용',
          remediation: '항상 0으로 정리부터',
        },
      ],
    },
    {
      code: 'QUADRATIC-FUNC',
      name: '이차함수',
      nameEn: 'Quadratic Functions',
      grade: 'MIDDLE_3',
      chapter: '4. 이차함수',
      order: 4,
      hours: 16,
      difficulty: 5,
      description: '포물선 그래프, 고등 수학의 시작점',
      objectives: [
        'y = ax² 그래프',
        'y = a(x-p)² + q 그래프',
        'y = ax² + bx + c 와 그래프의 관계',
      ],
      keyTerms: ['포물선', '축', '꼭짓점', '최댓값', '최솟값', '대칭축'],
      prerequisites: [
        { code: 'LINEAR-FUNCTIONS', strength: 'REQUIRED', reason: '함수/그래프 기본 개념' },
        { code: 'FACTORIZATION', strength: 'REQUIRED' },
        { code: 'QUADRATIC-EQ', strength: 'RECOMMENDED' },
      ],
      struggles: [
        {
          description: '꼭짓점 좌표 부호 혼동',
          frequency: 'VERY_COMMON',
          symptom: 'y = (x-3)² + 2 의 꼭짓점을 (-3, 2) 로 답함',
          rootCause: '표준형 y = (x-p)² + q 에서 p 부호 반대 이해 못함',
          remediation: '"괄호 안이 0 되는 x 값" 으로 접근',
        },
        {
          description: '일반형 → 표준형 변환 어려움',
          frequency: 'COMMON',
          symptom: '완전제곱식 만들기 과정 실수',
          remediation: '단계별 절차 명확히: 인수빼기 → 완전제곱 → 나머지 정리',
        },
      ],
      tips: [
        {
          tip: '이차함수 그래프는 농구공 포물선으로 동기부여',
          source: 'gamsagyo',
        },
      ],
    },
    {
      code: 'PYTHAGOREAN',
      name: '피타고라스 정리',
      nameEn: 'Pythagorean Theorem',
      grade: 'MIDDLE_3',
      chapter: '5. 피타고라스 정리',
      order: 5,
      hours: 10,
      difficulty: 3,
      objectives: ['피타고라스 정리', '정리의 활용', '피타고라스 정리의 역'],
      keyTerms: ['직각삼각형', '빗변', '피타고라스 정리'],
      prerequisites: [
        { code: 'SQUARE-ROOTS', strength: 'REQUIRED' },
        { code: 'TRIANGLE-PROPERTIES', strength: 'REQUIRED' },
      ],
      struggles: [
        {
          description: '빗변 식별 오류',
          frequency: 'COMMON',
          symptom: '가장 긴 변이 아닌 변을 c로 설정',
          remediation: '"빗변 = 직각 맞은편 = 가장 긴 변" 확인',
        },
      ],
    },
    {
      code: 'TRIGONOMETRY',
      name: '삼각비',
      nameEn: 'Trigonometric Ratios',
      grade: 'MIDDLE_3',
      chapter: '6. 삼각비',
      order: 6,
      hours: 12,
      difficulty: 4,
      objectives: ['삼각비의 뜻', '특수각의 삼각비', '삼각비의 활용'],
      keyTerms: ['sin', 'cos', 'tan', '삼각비'],
      prerequisites: [
        { code: 'PYTHAGOREAN', strength: 'REQUIRED' },
        { code: 'SIMILARITY', strength: 'REQUIRED', reason: '닮은 삼각형에서 비율 일정' },
      ],
      struggles: [
        {
          description: 'sin, cos, tan 정의 혼동',
          frequency: 'VERY_COMMON',
          symptom: 'sin = 밑변/빗변 으로 기억',
          rootCause: '정의 암기 불확실',
          remediation: '"소코아탄" 또는 SOH-CAH-TOA 구호',
        },
      ],
    },
    {
      code: 'CIRCLE',
      name: '원의 성질',
      nameEn: 'Properties of Circles',
      grade: 'MIDDLE_3',
      chapter: '7. 원의 성질',
      order: 7,
      hours: 14,
      difficulty: 4,
      objectives: ['원과 직선', '원주각', '원과 비례', '원의 넓이와 호의 길이'],
      keyTerms: ['현', '접선', '할선', '원주각', '중심각'],
      prerequisites: [
        { code: 'PLANE-FIGURES', strength: 'REQUIRED' },
        { code: 'PYTHAGOREAN', strength: 'RECOMMENDED' },
      ],
      struggles: [
        {
          description: '원주각과 중심각 관계 혼동',
          frequency: 'COMMON',
          symptom: '같은 호에 대한 원주각 = 중심각 으로 답함',
          remediation: '원주각 = 중심각/2 반복 강조',
        },
      ],
    },
    {
      code: 'STATISTICS-2',
      name: '대푯값과 산포도',
      nameEn: 'Measures of Center and Spread',
      grade: 'MIDDLE_3',
      chapter: '8. 통계',
      order: 8,
      hours: 10,
      difficulty: 3,
      objectives: ['평균, 중앙값, 최빈값', '분산과 표준편차'],
      keyTerms: ['대푯값', '평균', '중앙값', '최빈값', '분산', '표준편차'],
      prerequisites: [{ code: 'STATISTICS-1', strength: 'RECOMMENDED' }],
      struggles: [
        {
          description: '분산 계산 과정 실수',
          frequency: 'COMMON',
          symptom: '편차 제곱 후 평균 대신 합만 구함',
          remediation: '분산 = 편차²의 평균 단계 명확히',
        },
      ],
    },
  ],
};

export default KR_MATH_MIDDLE;
