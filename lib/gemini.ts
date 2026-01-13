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
당신은 시험/숙제 분석 전문가입니다. 이 이미지를 자세히 분석해주세요.

1. **과목 판별**: 수학/국어/영어/과학/사회/기타 중 하나

2. **점수 확인**: 
   - 이미지에서 보이는 점수 (없으면 null)
   - 총점 (없으면 null)

3. **틀린 문제 상세 분석**:
   X 표시, 빨간펜 체크, 감점 표시 등으로 틀린 것으로 보이는 모든 문제를 찾아주세요.
   
   각 틀린 문제에 대해:
   - 문제 번호 (예: 3번, 4-1번 등)
   - 학생이 쓴 답 (보이면)
   - 정답으로 보이는 것 (보이면)
   - 오류 유형:
     * 수학: 계산실수, 부호오류, 공식대입실수, 조건누락, 개념혼동
     * 국어/영어: 어휘혼동, 문맥파악실패, 선지함정, 질문오독
     * 과학/사회: 개념혼동, 자료해석오류, 단위실수
   - 왜 틀렸는지 구체적 설명 (1-2문장)

4. **종합 인사이트**: 학생에게 도움이 될 조언 (격려 포함)

JSON 형식으로만 답변해주세요:
{
  "subject": "수학",
  "score": 78,
  "totalScore": 100,
  "errors": [
    {
      "questionNumber": "3번",
      "studentAnswer": "x = 5",
      "correctAnswer": "x = -5",
      "errorType": "부호오류",
      "description": "이차방정식 근의 공식에서 마이너스 부호를 놓쳤어요"
    },
    {
      "questionNumber": "7번",
      "studentAnswer": "36",
      "correctAnswer": "42",
      "errorType": "계산실수",
      "description": "6 x 7 = 42인데 36으로 계산했어요"
    }
  ],
  "insights": "계산 실수가 2개 있었어요. 다 풀고 검산하는 습관을 들이면 +10점 가능해요!",
  "potentialScore": 88
}

점수를 모르면 score와 totalScore에 null을 넣으세요.
이미지가 시험지가 아니면 subject를 "기타"로, errors를 []로 하세요.
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

    // 틀린 문제 상세
    if (result.errors.length > 0) {
        message += `❌ 틀린 문제: ${result.errors.length}개\n\n`;

        message += `📋 상세 분석\n`;
        message += `━━━━━━━━━━\n`;

        result.errors.forEach((err, index) => {
            const num = err.questionNumber || `${index + 1}번`;
            message += `\n🔸 ${num}\n`;

            // 학생 답 vs 정답
            if (err.studentAnswer && err.correctAnswer) {
                message += `   ✗ 내 답: ${err.studentAnswer}\n`;
                message += `   ✓ 정답: ${err.correctAnswer}\n`;
            }

            // 오류 유형
            message += `   📌 ${err.errorType}\n`;

            // 설명
            if (err.description) {
                message += `   💬 ${err.description}\n`;
            }
        });
    } else {
        message += `🎉 틀린 문제 없음! 완벽해요!\n`;
    }

    // 인사이트
    if (result.insights) {
        message += `\n💡 ${result.insights}\n`;
    }

    // 잠재 점수
    if (result.potentialScore !== undefined && result.score !== undefined) {
        const diff = result.potentialScore - result.score;
        if (diff > 0) {
            message += `\n🎯 실수만 없었으면 ${result.potentialScore}점! (+${diff}점)`;
        }
    }

    return message;
}
