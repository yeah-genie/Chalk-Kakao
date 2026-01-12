# Chalk 데이터 분석 고도화 기획서

## Phase 4: Advanced Analytics & Insights

---

## 1. 현재 분석 기능 요약

### 1.1 망각 곡선 기반 예측 (Ebbinghaus Forgetting Curve)
- **구현 위치**: `lib/services/prediction.ts`
- **기능**:
  - `getTopicPredictions()`: 토픽별 점수 예측 및 복습 추천
  - `analyzeWeaknesses()`: 학습 패턴 분석 (stuck, declining, slow_progress)
  - `predictProgress()`: 목표 달성 예측 및 세션 수 계산
  - `getNextSessionRecommendations()`: 다음 세션 집중 토픽 추천

### 1.2 세션 자동 분석
- **구현 위치**: `lib/actions/analysis.ts`
- **기능**:
  - 음성 녹음 → Whisper API 트랜스크립션
  - Gemini AI 토픽 추출 및 숙련도 평가
  - 자동 mastery 점수 업데이트

### 1.3 현재 한계점
- 학생 간 비교 분석 부재
- 시계열 트렌드 시각화 제한
- 예측 모델의 개인화 부족
- 클래스/그룹 레벨 분석 없음

---

## 2. 고도화 방향

### 2.1 개인화 학습 분석 (Personalized Learning Analytics)

#### A. 학습 스타일 프로파일링
```typescript
interface LearningProfile {
  studentId: string;

  // 학습 패턴
  optimalSessionDuration: number;      // 최적 세션 길이 (분)
  peakPerformanceTime: 'morning' | 'afternoon' | 'evening';
  preferredPace: 'fast' | 'moderate' | 'slow';

  // 강점/약점
  strongTopicTypes: string[];          // e.g., ['conceptual', 'calculation']
  weakTopicTypes: string[];

  // 망각 패턴
  personalRetentionRate: number;       // 개인화된 retention rate
  optimalReviewInterval: number;       // 최적 복습 간격 (일)

  // 학습 효율성
  averageImprovementPerSession: number;
  bestLearningConditions: string[];
}
```

**구현 방안**:
1. 세션 시간대, 길이, 성과 데이터 수집
2. 토픽 유형별 성과 분석
3. 개인별 망각 곡선 파라미터 학습
4. 2주 이상 데이터 축적 후 프로파일 생성

#### B. 적응형 학습 경로 (Adaptive Learning Path)
```typescript
interface AdaptivePath {
  currentTopic: string;
  recommendedNext: string[];           // 우선순위 순
  skipSuggestions: string[];           // 이미 숙달된 토픽
  prerequisiteGaps: string[];          // 선수 지식 부족
  estimatedTimeToMastery: number;      // 예상 완료 시간
}
```

**구현 방안**:
1. Knowledge Graph dependency 활용
2. 현재 mastery 기반 경로 최적화
3. 개인 학습 속도 반영

---

### 2.2 비교 분석 (Comparative Analytics)

#### A. 클래스 내 상대 위치
```typescript
interface ClassComparison {
  studentId: string;
  classId: string;

  overallRank: number;
  percentile: number;

  topicComparisons: {
    topicId: string;
    studentScore: number;
    classAverage: number;
    classBest: number;
    gap: number;                       // 평균과의 차이
  }[];

  strengthsVsClass: string[];          // 클래스 평균보다 높은 토픽
  gapsVsClass: string[];               // 클래스 평균보다 낮은 토픽
}
```

#### B. 익명 벤치마크
```typescript
interface GlobalBenchmark {
  subjectId: string;

  // 전체 사용자 대비
  globalPercentile: number;
  similarStudentPercentile: number;    // 비슷한 시작점 학생 대비

  // 트렌드
  weeklyProgressRank: number;          // 주간 성장률 순위
  consistencyScore: number;            // 꾸준함 점수
}
```

---

### 2.3 시계열 분석 (Time Series Analytics)

#### A. 학습 트렌드 분석
```typescript
interface LearningTrend {
  studentId: string;
  period: 'weekly' | 'monthly' | 'quarterly';

  masteryTrend: {
    date: string;
    averageMastery: number;
    topicsLearned: number;
    sessionCount: number;
  }[];

  velocity: number;                    // 학습 속도 (점수/주)
  acceleration: number;                // 속도 변화
  projectedMastery: number;            // N주 후 예상 mastery

  seasonalPatterns: {
    dayOfWeek: Record<string, number>; // 요일별 성과
    timeOfDay: Record<string, number>; // 시간대별 성과
  };
}
```

#### B. 이탈 위험 예측 (Churn Prediction)
```typescript
interface ChurnRisk {
  studentId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;                   // 0-100

  indicators: {
    daysSinceLastSession: number;
    sessionFrequencyTrend: 'increasing' | 'stable' | 'decreasing';
    masteryPlateau: boolean;
    engagementDrop: boolean;
  };

  suggestedInterventions: string[];
}
```

---

### 2.4 AI 기반 인사이트 (AI-Powered Insights)

#### A. 자연어 인사이트 생성
```typescript
interface NarrativeInsight {
  studentId: string;
  generatedAt: string;

  summary: string;                     // "지난 2주간 미적분 영역에서 현저한 성장..."
  highlights: string[];                // 주요 성과
  concerns: string[];                  // 우려 사항
  recommendations: string[];           // 구체적 제안

  // 학부모용 요약
  parentFriendlyVersion: string;
}
```

**Gemini 프롬프트 구조**:
```
학생 학습 데이터를 분석하여 인사이트를 생성해주세요:

[학생 데이터]
- 현재 평균 mastery: {score}%
- 지난 2주 변화: {delta}%
- 강점 토픽: {strengths}
- 약점 토픽: {weaknesses}
- 세션 빈도: {frequency}

[요청]
1. 2-3문장 요약
2. 3개 핵심 성과
3. 2개 개선 제안
4. 학부모 보고용 1문장 요약
```

#### B. 스마트 알림 (Smart Notifications)
```typescript
interface SmartAlert {
  type: 'achievement' | 'warning' | 'recommendation' | 'milestone';
  priority: 'low' | 'medium' | 'high';

  title: string;
  message: string;
  actionUrl?: string;

  // 알림 조건
  triggerCondition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'change';
    threshold: number;
  };
}
```

**알림 유형**:
1. **성취 알림**: "축하합니다! 미분 영역 mastery 80% 달성"
2. **경고 알림**: "적분 영역 2주간 학습 없음. 망각 위험"
3. **추천 알림**: "오늘 최적 복습 시간: 오후 3시 (역대 성과 데이터 기반)"
4. **마일스톤**: "100번째 세션 완료! 누적 학습 시간 50시간"

---

### 2.5 리포트 자동화 (Automated Reporting)

#### A. 주간/월간 리포트
```typescript
interface PeriodicReport {
  studentId: string;
  period: { start: string; end: string };

  // 핵심 지표
  metrics: {
    sessionCount: number;
    totalMinutes: number;
    topicsReviewed: number;
    newTopicsStarted: number;
    masteryChange: number;
  };

  // 시각화 데이터
  charts: {
    masteryOverTime: DataPoint[];
    topicBreakdown: PieData[];
    weeklyHeatmap: HeatmapData;
  };

  // AI 인사이트
  aiSummary: NarrativeInsight;

  // 다음 주 계획
  nextWeekPlan: {
    focusTopics: string[];
    suggestedSessions: number;
    targetMastery: number;
  };
}
```

#### B. PDF 리포트 생성
- React-PDF 또는 Puppeteer 기반
- 학부모/학생 공유용 깔끔한 디자인
- 이메일 자동 발송 옵션

---

## 3. 구현 우선순위

### Phase 4.1 (즉시 구현)
1. **학습 트렌드 시각화**
   - 시계열 차트 (mastery over time)
   - 주간 활동 히트맵
   - 토픽별 진행률 바

2. **스마트 알림 기본**
   - 복습 리마인더
   - 마일스톤 축하
   - 이탈 위험 경고

3. **주간 요약 이메일**
   - 기본 메트릭 리포트
   - AI 1줄 요약

### Phase 4.2 (1-2주 내)
1. **개인화 학습 프로파일**
   - 최적 세션 시간 분석
   - 개인 망각 곡선 파라미터

2. **클래스 비교 분석**
   - 상대 위치 표시
   - 익명 벤치마크

3. **적응형 학습 경로**
   - 다음 토픽 추천
   - 선수지식 갭 분석

### Phase 4.3 (1개월 내)
1. **AI 인사이트 생성**
   - Gemini 기반 자연어 요약
   - 학부모용 리포트

2. **PDF 리포트 생성**
   - 월간 리포트 자동 생성
   - 공유 가능한 링크

3. **예측 모델 고도화**
   - 머신러닝 기반 점수 예측
   - 개인화된 학습 추천

---

## 4. 기술 스택 제안

### 시각화
- **recharts**: 시계열 차트, 바 차트
- **nivo**: 히트맵, 레이더 차트
- **react-chartjs-2**: 복잡한 커스텀 차트

### AI/ML
- **Gemini API**: 자연어 인사이트 생성
- **TensorFlow.js** (선택): 브라우저 내 예측 모델

### 리포트
- **@react-pdf/renderer**: PDF 생성
- **Resend / SendGrid**: 이메일 발송

### 데이터 처리
- **Supabase Edge Functions**: 백그라운드 분석 작업
- **PostgreSQL Materialized Views**: 집계 데이터 캐싱

---

## 5. 데이터 스키마 추가 제안

```sql
-- 학습 이벤트 로그 (상세 추적)
CREATE TABLE learning_events (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    event_type TEXT, -- 'session_start', 'topic_completed', 'quiz_taken', etc.
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 분석 집계 (일별)
CREATE TABLE daily_analytics (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    date DATE,
    total_minutes INTEGER,
    session_count INTEGER,
    topics_reviewed INTEGER,
    average_mastery NUMERIC(5,2),
    mastery_delta NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- 스마트 알림 기록
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 리포트 기록
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    report_type TEXT, -- 'weekly', 'monthly', 'custom'
    period_start DATE,
    period_end DATE,
    data JSONB,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. KPI & 성공 지표

### 학습 효과성
- 평균 mastery 증가율
- 토픽 완료 속도
- 망각률 감소

### 사용자 참여
- 주간 활성 사용자 (WAU)
- 평균 세션 빈도
- 이탈률 감소

### 시스템 품질
- 예측 정확도 (MAPE)
- AI 인사이트 만족도
- 리포트 조회율

---

## 7. 다음 단계

1. **Phase 4.1 구현 시작**: 학습 트렌드 시각화 컴포넌트 개발
2. **A/B 테스트 설계**: 스마트 알림 효과 측정
3. **사용자 피드백 수집**: 인사이트 품질 개선

---

*문서 버전: 1.0*
*작성일: 2026-01-01*
*다음 리뷰: Phase 4.1 완료 후*
