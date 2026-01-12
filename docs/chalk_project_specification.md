# Chalk: AI-Powered Tutoring Analytics Platform
## 프로젝트 종합 기술 명세서 v1.0

> **"Unfakeable Portfolio"** - 튜터의 실제 수업 데이터를 기반으로 검증 가능한 포트폴리오를 자동 생성하는 프리미엄 튜터링 분석 플랫폼

---

## 📌 1. 프로젝트 개요

### 1.1 핵심 가치 제안
Chalk는 개인 과외 튜터를 위한 **AI 기반 수업 분석 및 학생 성장 추적 플랫폼**입니다.

| 문제점 | Chalk의 해결책 |
|--------|---------------|
| 튜터가 자신의 역량을 증명하기 어려움 | 실제 수업 데이터 기반의 "위조 불가능
한" 포트폴리오 자동 생성 |
| 학생 진도 파악이 주관적 | AI가 수업 녹음을 분석하여 객관적인 성취도 측정 |
| 학부모 소통에 시간 소모 | 자동화된 학부모 리포트 생성 및 발송 |
| 복습 타이밍 놓침 | 망각 곡선 기반 복습 알림 시스템 |

### 1.2 기술 스택

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│  Next.js 16 (App Router) + TypeScript + Tailwind CSS    │
│  D3.js (데이터 시각화) + Lucide React (아이콘)           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND                               │
│  Next.js Server Actions + Supabase (PostgreSQL + Auth)  │
│  Supabase Storage (오디오/이미지 저장)                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    AI SERVICES                           │
│  OpenAI Whisper API (음성→텍스트)                        │
│  Google Gemini 1.5 Flash (멀티모달 분석)                 │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    DEPLOYMENT                            │
│  Vercel (자동 배포) + GitHub (소스 관리)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 2. 프로젝트 구조

```
chalk-web/
├── app/                           # Next.js App Router
│   ├── page.tsx                   # 랜딩 페이지
│   ├── login/page.tsx             # 로그인 (Magic Link)
│   ├── auth/callback/route.ts     # OAuth 콜백
│   └── dashboard/                 # 대시보드 (인증 필요)
│       ├── page.tsx               # 메인 대시보드
│       ├── students/              # 학생 관리
│       │   ├── page.tsx           # 학생 목록
│       │   ├── student-list.tsx   # 학생 리스트 컴포넌트
│       │   └── [id]/              # 학생 상세
│       │       ├── page.tsx       # 서버 컴포넌트
│       │       └── StudentDetailClient.tsx  # 클라이언트
│       ├── sessions/page.tsx      # 세션 목록
│       ├── analysis/page.tsx      # 전체 학생 인사이트
│       ├── knowledge/page.tsx     # AI Taxonomy 관리
│       └── settings/page.tsx      # 설정
│
├── components/
│   ├── layout/Sidebar.tsx         # 사이드바 네비게이션
│   ├── monitoring/VoiceRecorder.tsx  # 녹음 + 이미지 업로드
│   ├── insights/
│   │   ├── PredictionPanel.tsx    # AI 예측 패널
│   │   ├── PredictionSkeleton.tsx # 로딩 스켈레톤
│   │   └── LearningTrendChart.tsx # D3.js 시계열 차트
│   ├── sessions/
│   │   └── InteractiveTranscript.tsx  # 오디오 동기화 전사
│   └── analysis/TopicInsightPanel.tsx # 토픽별 인사이트
│
├── lib/
│   ├── actions/                   # Server Actions
│   │   ├── crud.ts                # DB CRUD 작업
│   │   ├── analysis.ts            # AI 분석 파이프라인
│   │   ├── taxonomy.ts            # Taxonomy 승인/거절
│   │   └── reports.ts             # 학부모 리포트 생성
│   ├── services/                  # 외부 서비스 연동
│   │   ├── whisper.ts             # OpenAI Whisper STT
│   │   ├── gemini.ts              # Google Gemini API
│   │   └── prediction.ts          # 예측 엔진
│   ├── supabase/
│   │   ├── client.ts              # 브라우저 클라이언트
│   │   └── server.ts              # 서버 클라이언트
│   ├── types/database.ts          # TypeScript 타입 정의
│   └── knowledge-graph.ts         # AP 교육과정 데이터
│
└── supabase/
    ├── schema.sql                 # 코어 스키마
    └── migrations/
        ├── 20240101_v3_full_schema.sql    # KB 테이블
        ├── 20240101_v3_rls_fix.sql        # RLS 정책
        └── 20240102_p2_security_hardening.sql  # 보안 강화
```

---

## 🗄️ 3. 데이터베이스 스키마

### 3.1 핵심 테이블

```sql
-- 사용자 프로필 (Supabase Auth 연동)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'tutor',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 학생
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES profiles(id),
    name TEXT NOT NULL,
    subject_id TEXT,
    parent_email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수업 세션
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    tutor_id UUID REFERENCES profiles(id),
    scheduled_at TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled',  -- scheduled/completed/cancelled
    transcript TEXT,                   -- Whisper 전사 결과
    transcript_segments JSONB,         -- 타임스탬프 포함 세그먼트
    notes TEXT,                        -- AI 생성 요약
    audio_url TEXT,
    evidence_urls TEXT[],              -- 멀티모달 이미지 URLs
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 세션-토픽 연결 (어떤 토픽을 다뤘는지)
CREATE TABLE session_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    topic_id TEXT NOT NULL,
    status_before TEXT,
    status_after TEXT,
    evidence TEXT,
    future_impact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 학생별 토픽 숙련도
CREATE TABLE student_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    topic_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'new',  -- new/learning/reviewed/mastered
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 지식 베이스 테이블 (KB)

```sql
-- 교육과정 계층: Board > Subject > Module > Unit > Topic
CREATE TABLE kb_boards (id UUID, name TEXT, code TEXT);
CREATE TABLE kb_subjects (id UUID, board_id UUID, name TEXT, code TEXT);
CREATE TABLE kb_modules (id UUID, subject_id UUID, name TEXT, code TEXT);
CREATE TABLE kb_units (id UUID, module_id UUID, name TEXT, code TEXT);
CREATE TABLE kb_topics (id UUID, unit_id UUID, name TEXT, code TEXT);

-- AI가 제안한 새 토픽 (튜터 승인 대기)
CREATE TABLE kb_proposed_taxonomy (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    proposed_type TEXT,           -- 'unit' 또는 'topic'
    proposed_name TEXT,
    proposed_parent_id TEXT,
    ai_rationale TEXT,
    status TEXT DEFAULT 'pending' -- pending/approved/rejected
);
```

### 3.3 Row Level Security (RLS)

```sql
-- 튜터는 자신의 학생만 조회 가능
CREATE POLICY "Tutors can only see their students"
ON students FOR ALL
USING (tutor_id = auth.uid());

-- 세션도 동일하게 제한
CREATE POLICY "Tutors can only see their sessions"
ON sessions FOR ALL
USING (tutor_id = auth.uid());

-- Storage: recordings 버킷은 튜터별 폴더로 분리
CREATE POLICY "Tutors can upload to their folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'recordings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 🤖 4. AI 분석 파이프라인

### 4.1 전체 흐름

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  VoiceRecorder  │ → │   Whisper   │ → │   Gemini    │ → │   Database  │
│  (녹음+이미지) │   │   (STT)     │   │  (분석)     │   │   (저장)    │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### 4.2 Whisper 통합 (`lib/services/whisper.ts`)

```typescript
export async function transcribeAudio(audioBlob: Blob): Promise<{
    text: string;
    segments: Array<{ start: number; end: number; text: string }>;
}> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: formData
    });

    const result = await response.json();
    return {
        text: result.text,
        segments: result.segments.map(s => ({
            start: s.start,
            end: s.end,
            text: s.text
        }))
    };
}
```

### 4.3 Gemini 멀티모달 분석 (`lib/services/gemini.ts`)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function extractTopicsFromTranscript(
    transcript: string,
    subjectId: string,
    existingTopics: Topic[],
    images: MultimodalImage[] = []
): Promise<ExtractionResult> {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an expert educational analyst. Analyze this tutoring session.
    
    SUBJECT: ${subjectId}
    TRANSCRIPT: ${transcript}
    EXISTING TOPICS: ${JSON.stringify(existingTopics)}
    
    Return JSON with:
    1. topicsDiscussed: Which existing topics were covered
    2. masteryAssessment: Student's understanding level (0-100)
    3. suggestedNewNodes: Any topics not in existing curriculum
    4. summary: 2-3 sentence session overview
    `;

    const result = await model.generateContent([prompt, ...images]);
    return JSON.parse(result.response.text());
}
```

### 4.4 예측 엔진 (`lib/services/prediction.ts`)

```typescript
// Ebbinghaus 망각 곡선 기반 점수 예측
function calculateRetention(initialScore: number, daysSince: number): number {
    const stability = 1 + (initialScore / 100) * 6;
    return Math.exp(-daysSince / stability);
}

export async function getStudentPredictions(studentId: string): Promise<PredictionData> {
    // 1. 현재 숙련도 조회
    // 2. 시간 경과에 따른 기억 감퇴 예측
    // 3. 복습 필요 토픽 식별 (critical/warning)
    // 4. 다음 세션 추천 토픽 결정
    // 5. 약점 패턴 분석 (stuck, declining, slow_progress)
    
    return {
        nextSessionRecommendation: { topicId, topicName, reason },
        retentionAlerts: [...],
        progressForecast: { currentMastery, targetMastery, estimatedSessions },
        weaknessPatterns: [...]
    };
}
```

---

## 🎨 5. 주요 UI 컴포넌트

### 5.1 VoiceRecorder (녹음 + 이미지 업로드)

```tsx
// 핵심 상태
const [isRecording, setIsRecording] = useState(false);
const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
const [images, setImages] = useState<File[]>([]);  // 최대 3장
const [selectedStudentId, setSelectedStudentId] = useState<string>();

// 녹음 시작/중지
const handleRecord = async () => {
    if (isRecording) {
        recorder.stop();  // Blob 생성
    } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder = new MediaRecorder(stream);
        recorder.start();
    }
};

// 분석 실행
const handleAnalyze = async () => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('studentId', selectedStudentId);
    formData.append('imageCount', images.length.toString());
    images.forEach((img, i) => formData.append(`image_${i}`, img));
    
    await processSessionAudio(formData);
};
```

### 5.2 InteractiveTranscript (오디오 동기화)

```tsx
interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
}

export default function InteractiveTranscript({ 
    segments, 
    audioUrl 
}: Props) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTime, setCurrentTime] = useState(0);

    // 현재 재생 구간 하이라이트
    const activeSegmentIndex = segments.findIndex(
        s => currentTime >= s.start && currentTime < s.end
    );

    // 클릭 시 해당 시점으로 이동
    const handleSegmentClick = (startTime: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = startTime;
        }
    };

    return (
        <div>
            <audio ref={audioRef} src={audioUrl} onTimeUpdate={...} />
            {segments.map((segment, i) => (
                <span
                    key={i}
                    className={i === activeSegmentIndex ? 'bg-emerald-500/30' : ''}
                    onClick={() => handleSegmentClick(segment.start)}
                >
                    {segment.text}
                </span>
            ))}
        </div>
    );
}
```

### 5.3 LearningTrendChart (D3.js 시계열)

```tsx
export default function LearningTrendChart({ history }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        
        // Scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(history, d => new Date(d.date)))
            .range([0, width]);
        
        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        // Line + Area
        const line = d3.line()
            .x(d => xScale(new Date(d.date)))
            .y(d => yScale(d.score))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(history)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#10b981');
            
        // 성적 하락 감지 → Alert 표시
        detectPerformanceDrops(history);
    }, [history]);

    return <svg ref={svgRef} />;
}
```

### 5.4 PredictionPanel (AI 예측 패널)

주요 섹션:
1. **Recommended Focus**: 다음 세션에 다룰 최우선 토픽
2. **Adaptive Roadmap**: 단계별 학습 경로 (현재 → 다음 → 최종 목표)
3. **Progress Forecast**: 숙련도 진도 바 + 예상 세션 수
4. **Retention Alerts**: 망각 위험 토픽 리스트
5. **Weakness Analysis**: 정체/하락 패턴 감지

---

## 🔐 6. 인증 및 보안

### 6.1 Supabase Auth (Magic Link)

```typescript
// 로그인 요청
const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` }
});

// 콜백 처리
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (code) {
        const supabase = await createServerSupabaseClient();
        await supabase.auth.exchangeCodeForSession(code);
    }
    
    return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

### 6.2 미들웨어 보호

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}
```

---

## 🚀 7. 배포 (Vercel)

### 7.1 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

### 7.2 빌드 명령어

```bash
npm run build   # Next.js 프로덕션 빌드
npm run lint    # ESLint 검사
```

---

## 💡 8. 다음 고도화 방향 제안

### Option A: 학생 데이터 분석 심화 📊

**근거**: 튜터/학부모 대상 리서치 결과, 가장 원하는 인사이트

| 기능 | 설명 | 비즈니스 가치 |
|------|------|--------------|
| **🎯 마스터리 예상 시간** | "현재 주 2회 수업 기준, 미적분 마스터까지 약 4개월 소요 예상" | 학부모에게 명확한 타임라인 제시 → 신뢰도 ↑ |
| **⚠️ 조기 경고 시스템** | 3회 연속 같은 개념에서 막히면 튜터에게 알림 | 문제가 커지기 전 개입 가능 |
| **💰 세션 ROI 분석** | "지난 10회 수업에서 성적 15% 향상, 세션당 평균 1.5% 상승" | 튜터 가치 증명 → 가격 정당화 |
| **📊 학습 효율 벤치마크** | "평균 학생은 이 단원에 8시간 필요, 이 학생은 6시간 만에 완료" | 학생 강점 발견 및 동기부여 |
| **🔄 복습 주기 최적화** | Ebbinghaus 곡선 기반 "3일 후, 7일 후, 21일 후" 복습 스케줄 자동 제안 | 장기 기억 정착률 향상 |
| **📈 학부모 리포트 자동화** | 매주 "이번 주 배운 것 / 잘한 점 / 다음 주 목표" AI 요약 발송 | 학부모 소통 시간 90% 절감 |

**구현 우선순위 (Quick Wins)**:
1. **마스터리 예상 시간** - 이미 있는 세션 데이터로 계산 가능
2. **조기 경고 시스템** - `session_topics` 테이블 분석으로 구현
3. **학부모 리포트** - Gemini API로 요약 생성 후 이메일 발송

### Option B: UI/UX 정교화 🎨

**장점**: 첫인상에서 프리미엄 느낌, 사용자 체류 시간 증가

| 기능 | 설명 |
|------|------|
| **마이크로 인터랙션** | 버튼 호버, 스크롤 애니메이션, 로딩 트랜지션 |
| **다크/라이트 모드** | 시스템 설정 연동 + 수동 토글 |
| **모바일 최적화** | 태블릿에서 수업 중 사용 가능하도록 |
| **커스텀 대시보드** | 위젯 드래그 앤 드롭 배치 |
| **오디오 웨이브폼** | 녹음 중 실시간 파형 시각화 |

### 🏆 나의 추천: **Option A + B 하이브리드**

> **"Data Storytelling"** 접근법

단순히 데이터를 더 분석하거나 UI를 예쁘게 만드는 것보다, **데이터를 스토리로 전달하는** 방식이 가장 임팩트가 큽니다.

**구체적 제안**:

1. **학생 성장 스토리 생성기**
   - AI가 한 학생의 6개월 데이터를 분석하여 "성장 스토리" 내러티브 자동 생성
   - "준서는 처음 미적분에서 어려움을 겪었지만, 3개월간의 집중 복습으로..."
   - 학부모에게 공유 가능한 비주얼 리포트

2. **튜터 포트폴리오 자동 생성**
   - 모든 학생의 성장 데이터를 집계하여 튜터의 "성과 카드" 생성
   - "평균 성적 향상 23%", "복습 리마인더 준수율 89%"
   - 새 학생 모집 시 링크로 공유 가능

3. **인터랙티브 타임라인**
   - 학생 상세 페이지에 가로 스크롤 타임라인
   - 각 세션이 칩으로 표시되고, 호버하면 그날의 핵심 인사이트
   - 성적 변화와 이벤트를 시각적으로 연결

이 접근법은:
- 마켓플레이스 없이도 **튜터가 자신을 마케팅할 무기**가 됨
- 데이터 분석의 결과물이 **눈에 보이는 가치**로 전환됨
- UI/UX 개선이 **목적 있는 개선**이 됨

---

## 📋 9. 환경 설정 체크리스트

새로 시작할 경우:

- [ ] Node.js 18+ 설치
- [ ] `npm install` 실행
- [ ] Supabase 프로젝트 생성 및 URL/키 설정
- [ ] `supabase/schema.sql` 실행
- [ ] `supabase/migrations/*.sql` 순서대로 실행
- [ ] OpenAI API 키 발급
- [ ] Google AI Studio에서 Gemini API 키 발급
- [ ] Vercel 프로젝트 연결 및 환경 변수 설정
- [ ] `npm run dev`로 로컬 테스트
- [ ] `git push`로 자동 배포

---

*문서 작성일: 2026-01-02*
*최종 커밋: `a7edb51`*
