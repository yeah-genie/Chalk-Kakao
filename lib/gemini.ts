// Gemini Vision 클라이언트
// 이미지를 분석해서 시험지 정보를 추출하는 AI

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExamAnalysisResult } from "@/app/api/kakao/types";

// Gemini API 설정
// 쉽게 말하면: Google AI와 대화할 수 있는 "전화기"를 만드는 거예요
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * 시험지 이미지를 Gemini Vision으로 분석
 * 
 * @param imageUrl - 분석할 이미지 URL
 * @returns 분석 결과 (과목, 점수, 오류 목록 등)
 * 
 * 동작 원리:
 * 1. 이미지 URL에서 이미지 데이터를 가져옴
 * 2. Gemini AI에게 "이 시험지를 분석해줘"라고 요청
 * 3. AI가 분석 결과를 JSON으로 반환
 */
export async function analyzeExamImage(imageUrl: string): Promise<ExamAnalysisResult> {
    try {
        console.log("=== 이미지 분석 시작 ===");
        console.log("이미지 URL:", imageUrl);

        // 1. 이미지 다운로드
        console.log("1. 이미지 다운로드 중...");
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            console.error("이미지 다운로드 실패:", imageResponse.status, imageResponse.statusText);
            throw new Error(`이미지 다운로드 실패: ${imageResponse.status}`);
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString("base64");
        console.log("이미지 크기:", imageBuffer.byteLength, "bytes");

        // 이미지 타입 확인 (대부분 jpeg)
        const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";
        console.log("이미지 타입:", mimeType);

        // 2. Gemini 모델 준비 (안정적인 모델 사용)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        // 3. AI에게 분석 요청 (프롬프트)
        const prompt = `
당신은 10년 경력의 과외 선생님입니다. 학생이 시험지 사진을 보냈어요.
학생이 "왜 틀렸는지"를 정확히 이해하고 다음에 안 틀리도록 도와주세요.

## 분석 순서

### 1. 과목 판별
수학/국어/영어/과학/사회/기타 중 하나

### 2. 점수 확인
이미지에서 점수가 보이면 기록 (없으면 null)

### 3. 틀린 문제 상세 분석
X 표시, 빨간펜 체크, 감점 표시를 찾아 모든 틀린 문제를 분석하세요.

각 틀린 문제에 대해 다음을 분석:

**[수학]** 오류 유형:
- 부호실수: 음수 계산 시 부호 반전 실수
- 계산실수: 사칙연산 오류 (덧셈, 곱셈 등)
- 공식오류: 공식을 잘못 기억하거나 적용
- 조건누락: 문제의 조건을 빠뜨림 (예: x>0 조건)
- 단위실수: 단위 변환 오류
- 그래프오독: 그래프/도형 해석 실수

**[국어]** 오류 유형:
- 지문오독: 지문 내용을 잘못 이해
- 선지함정: 비슷한 선지에 함정에 빠짐
- 질문혼동: "옳은 것"을 "옳지 않은 것"으로 착각
- 어휘미숙: 어휘 의미를 잘못 알고 있음
- 추론비약: 지문에 없는 내용을 추론

**[영어]** 오류 유형:
- 어휘혼동: 비슷한 단어 혼동 (affect/effect)
- 문법실수: 시제, 수일치 등 문법 오류
- 문맥파악실패: 글의 흐름 이해 부족
- 지문오독: 영어 지문 해석 실수

**[과학/사회]** 오류 유형:
- 개념혼동: 비슷한 개념 구분 못함
- 자료해석오류: 그래프/표 해석 실수
- 단위실수: 과학적 단위 오류
- 암기부족: 핵심 용어/연도 미숙지

### 4. 실수 패턴 분석
이번 시험에서 반복된 실수 유형이 있다면 정리

### 5. 구체적 공부법 제안
이 학생에게 맞는 실질적인 공부 팁 제시

## JSON 응답 형식

{
  "subject": "수학",
  "score": 78,
  "totalScore": 100,
  "errors": [
    {
      "questionNumber": "3번",
      "studentAnswer": "-6",
      "correctAnswer": "6",
      "errorType": "부호실수",
      "description": "(-2) × (-3) = 6인데, 음수 × 음수가 양수인 것을 놓쳐서 -6으로 계산",
      "relatedConcept": "음수의 곱셈",
      "studyTip": "음수끼리 곱하면 동그라미 2개 → 양수! 로 외우세요"
    },
    {
      "questionNumber": "7번",
      "studentAnswer": "x = 3",
      "correctAnswer": "x = 3 또는 x = -3",
      "errorType": "조건누락",
      "description": "x² = 9의 해는 ±3인데 양수 해만 적음",
      "relatedConcept": "이차방정식의 해",
      "studyTip": "제곱이 나오면 반드시 ± 체크!"
    }
  ],
  "errorPattern": "이번 시험에서 '부호 관련 실수'가 2번 반복됐어요. 음수 계산이 약점이에요!",
  "insights": "계산 실력은 좋은데 음수에서 자주 실수해요. 음수에 동그라미 치는 습관을 들이면 금방 고칠 수 있어요! 💪",
  "studyPlan": [
    "1. 음수 곱셈/나눗셈 규칙 복습 (10분)",
    "2. 음수 계산 문제 10개 풀기",
    "3. 풀 때 음수에 동그라미 치는 습관 들이기"
  ],
  "potentialScore": 90,
  "encouragement": "사실 이번 시험 잘 봤어요! 음수 실수만 고치면 90점이에요 🎉"
}

점수를 모르면 score와 totalScore에 null을 넣으세요.
시험지가 아니면 subject를 "기타"로 하세요.
JSON만 반환하세요.
`;


        // 4. AI 호출
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: base64Image,
                },
            },
        ]);

        // 5. 응답 파싱
        const responseText = result.response.text();

        // JSON 추출 (AI가 가끔 ```json ... ``` 형식으로 반환하기도 함)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI 응답에서 JSON을 찾을 수 없음");
        }

        const analysisResult: ExamAnalysisResult = JSON.parse(jsonMatch[0]);
        return analysisResult;

    } catch (error) {
        console.error("이미지 분석 오류:", error);

        // 오류 발생 시 기본 응답
        return {
            subject: "기타",
            errors: [],
            insights: "이미지 분석 중 오류가 발생했어요. 다시 시도해주세요!",
        };
    }
}

/**
 * 분석 결과를 사용자에게 보여줄 메시지로 변환
 * 
 * @param result - Gemini 분석 결과
 * @returns 카카오톡에 보여줄 텍스트
 */
export function formatAnalysisMessage(result: ExamAnalysisResult): string {
    // 시험지 인식 실패 시
    if (result.errors.length === 0 && result.subject === "기타") {
        return result.insights || "시험지를 인식하지 못했어요. 채점된 시험지를 다시 보내주세요!";
    }

    let message = `✅ ${result.subject} 분석 완료!\n\n`;

    // 점수 정보
    if (result.score !== null && result.score !== undefined &&
        result.totalScore !== null && result.totalScore !== undefined) {
        message += `📝 점수: ${result.score}/${result.totalScore}점\n`;
    }

    // 틀린 문제 상세 (최대 3개만 표시)
    if (result.errors.length > 0) {
        message += `❌ 틀린 문제: ${result.errors.length}개\n\n`;

        const displayErrors = result.errors.slice(0, 3); // 최대 3개만

        displayErrors.forEach((err, index) => {
            const num = err.questionNumber || `${index + 1}번`;
            message += `🔸 ${num}`;

            if (err.errorType) {
                message += ` (${err.errorType})`;
            }
            message += `\n`;

            // 학생 답 vs 정답 (간략히)
            if (err.studentAnswer && err.correctAnswer) {
                message += `  ${err.studentAnswer} → ${err.correctAnswer}\n`;
            }

            // 설명 (짧게)
            if (err.description) {
                const shortDesc = err.description.length > 50
                    ? err.description.substring(0, 47) + "..."
                    : err.description;
                message += `  💬 ${shortDesc}\n`;
            }

            // 공부 팁 (가장 중요!)
            if (err.studyTip) {
                const shortTip = err.studyTip.length > 40
                    ? err.studyTip.substring(0, 37) + "..."
                    : err.studyTip;
                message += `  💡 ${shortTip}\n`;
            }

            message += `\n`;
        });

        // 더 있으면 알림
        if (result.errors.length > 3) {
            message += `... 외 ${result.errors.length - 3}개 더\n`;
        }
    } else {
        message += `🎉 틀린 문제 없음! 완벽해요!\n`;
    }

    // 실수 패턴 (핵심!)
    if (result.errorPattern) {
        const shortPattern = result.errorPattern.length > 60
            ? result.errorPattern.substring(0, 57) + "..."
            : result.errorPattern;
        message += `\n⚠️ ${shortPattern}\n`;
    }

    // 잠재 점수
    if (result.potentialScore !== undefined && result.score !== undefined && result.score !== null) {
        const diff = result.potentialScore - result.score;
        if (diff > 0) {
            message += `\n🎯 실수 없었으면 ${result.potentialScore}점! (+${diff}점)`;
        }
    }

    // 격려 메시지 (짧게)
    if (result.encouragement) {
        const shortEnc = result.encouragement.length > 50
            ? result.encouragement.substring(0, 47) + "..."
            : result.encouragement;
        message += `\n\n${shortEnc}`;
    }

    // 최종 길이 체크 (카카오 최대 1000자)
    if (message.length > 950) {
        message = message.substring(0, 947) + "...";
    }

    return message;
}

