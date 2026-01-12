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
        // 1. 이미지 다운로드
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString("base64");

        // 이미지 타입 확인 (대부분 jpeg)
        const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

        // 2. Gemini 모델 준비 (Gemini 3 Flash - 2025년 12월 출시, 빠르고 정확!)
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

        // 3. AI에게 분석 요청 (프롬프트)
        const prompt = `
이 이미지는 채점된 시험지 또는 숙제입니다. 다음을 분석해주세요:

1. 과목 판별 (수학/국어/영어/과학/사회/기타 중 하나)
2. 총점 (보이면)
3. 틀린 문제 목록 (X 표시, 빨간펜, 체크, 동그라미 등으로 표시된 것)

각 틀린 문제에 대해:
- 문제 번호
- 오류 유형 (아래 분류 참고):
  * 수학: 계산실수, 조건누락, 개념오류, 문제오독, 풀이과정오류
  * 국어: 급하게읽기, 선지함정, 질문혼동, 추론비약, 어휘미숙
  * 영어: 어휘혼동, 문맥파악실패, 문법실수, 시제오류
  * 과학/사회: 개념혼동, 자료해석오류, 단위실수
- 간단한 설명 (왜 틀렸을 것 같은지 추측)

분석 결과를 아래 JSON 형식으로만 답변해주세요 (다른 텍스트 없이):
{
  "subject": "수학",
  "score": 78,
  "totalScore": 100,
  "errors": [
    {
      "questionNumber": 3,
      "errorType": "계산실수",
      "description": "부호 반전 실수"
    }
  ],
  "insights": "검토 시간을 5분만 더 가졌다면 계산 실수를 잡을 수 있었어요!",
  "potentialScore": 88
}

만약 이미지에서 시험지를 인식할 수 없다면:
{
  "subject": "기타",
  "errors": [],
  "insights": "시험지를 인식하지 못했어요. 채점된 시험지를 다시 보내주세요!"
}
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
    if (result.score !== undefined && result.totalScore !== undefined) {
        message += `📝 점수: ${result.score}/${result.totalScore}\n`;
    }

    // 틀린 문제 수
    if (result.errors.length > 0) {
        message += `❌ 틀린 문제: ${result.errors.length}개\n\n`;

        // 오류 유형별 정리
        const errorCounts: Record<string, number> = {};
        result.errors.forEach((err) => {
            errorCounts[err.errorType] = (errorCounts[err.errorType] || 0) + 1;
        });

        message += `⚠️ 오류 유형\n`;
        Object.entries(errorCounts).forEach(([type, count]) => {
            message += `• ${type}: ${count}개\n`;
        });
    } else {
        message += `🎉 틀린 문제 없음!\n`;
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
