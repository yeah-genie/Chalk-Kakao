// AI 숙제 분석 함수
// Supabase Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase 클라이언트
function getSupabaseClient() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    return createClient(supabaseUrl, supabaseKey);
}

// Gemini AI 클라이언트
function getGeminiClient() {
    const apiKey = Deno.env.get("GEMINI_API_KEY") || "";
    return new GoogleGenerativeAI(apiKey);
}

// 오류 유형 한국어 매핑
const ERROR_TYPE_MAP: Record<string, string> = {
    "sign": "부호 실수",
    "calculation": "계산 실수",
    "transposition": "이항 오류",
    "concept": "개념 오류",
    "fraction": "분수 오류",
    "equation": "방정식 오류",
    "geometry": "도형 오류",
    "graph_function": "함수 오류",
    "ratio": "비율 오류",
    "other": "기타 오류",
};

// 이미지 URL에서 Base64 데이터 가져오기
async function fetchImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Gemini로 이미지 분석
async function analyzeWithGemini(imageUrl: string): Promise<any> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const imageData = await fetchImageAsBase64(imageUrl);

    const prompt = `이 수학 숙제 이미지를 분석해주세요.

다음 형식으로 JSON 응답해주세요:
{
  "problems": [
    {
      "number": 1,
      "question": "원래 문제 (보이는 경우)",
      "student_work": "학생이 쓴 풀이 과정",
      "student_answer": "학생이 쓴 최종 답",
      "correct_answer": "올바른 답",
      "is_correct": true/false,
      "error_location": "오류 발생 위치 (예: 2번째 줄)",
      "error_type": "sign/calculation/transposition/concept/fraction/equation/other",
      "error_description": "상세 설명"
    }
  ],
  "total_problems": 5,
  "correct_count": 3,
  "accuracy": 0.6,
  "weakest_area": "가장 약한 영역"
}

중요:
- 정확히 JSON 형식으로만 응답
- 모든 문제를 분석
- 오답인 경우 어디서 틀렸는지 상세히 설명
- error_type은 위에 명시된 값 중 하나로`;

    try {
        const result = await model.generateContent([
            { text: prompt },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageData,
                },
            },
        ]);

        const responseText = result.response.text();

        // JSON 파싱
        let jsonText = responseText;
        if (jsonText.includes("```json")) {
            jsonText = jsonText.split("```json")[1].split("```")[0];
        } else if (jsonText.includes("```")) {
            jsonText = jsonText.split("```")[1].split("```")[0];
        }

        return JSON.parse(jsonText.trim());
    } catch (error) {
        console.error("Gemini 분석 오류:", error);
        throw error;
    }
}

// 카카오 Event API로 결과 푸시
async function sendKakaoEventResponse(
    botId: string,
    groupKey: string,
    resultText: string
) {
    const kakaoApiKey = Deno.env.get("KAKAO_REST_API_KEY") || "";

    // Event API 호출
    const response = await fetch(`https://bot-api.kakao.com/v2/bots/${botId}/group`, {
        method: "POST",
        headers: {
            "Authorization": `KakaoAK ${kakaoApiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            chat: {
                id: groupKey,
                type: "botGroupKey",
            },
            event: {
                name: "analysis_complete",
                data: {
                    result: resultText,
                },
            },
        }),
    });

    if (!response.ok) {
        console.error("카카오 Event API 실패:", await response.text());
    }
}

// 메인 핸들러
async function handleAnalyzeRequest(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { imageUrl, userId, groupKey, kakaoUserId, botId } = body;

        console.log("분석 요청:", { imageUrl, userId, groupKey });

        const supabase = getSupabaseClient();

        // 1. Gemini로 이미지 분석
        const analysisResult = await analyzeWithGemini(imageUrl);

        // 2. DB에 인증 기록 저장
        const { data: certification, error: certError } = await supabase
            .from("daily_certifications")
            .insert({
                user_id: userId,
                group_key: groupKey,
                image_url: imageUrl,
                analysis_result: analysisResult,
                total_problems: analysisResult.total_problems || 0,
                correct_count: analysisResult.correct_count || 0,
                accuracy: analysisResult.accuracy || 0,
            })
            .select()
            .single();

        if (certError) {
            console.error("인증 저장 실패:", certError);
        }

        // 3. 오답 기록 저장
        const wrongProblems = (analysisResult.problems || []).filter(
            (p: any) => !p.is_correct
        );

        for (const problem of wrongProblems) {
            await supabase.from("wrong_answers").insert({
                user_id: userId,
                certification_id: certification?.id,
                problem_number: problem.number,
                problem_text: problem.question,
                student_answer: problem.student_answer,
                correct_answer: problem.correct_answer,
                error_type: ERROR_TYPE_MAP[problem.error_type] || problem.error_type,
                error_location: problem.error_location,
                error_description: problem.error_description,
            });
        }

        // 4. 결과 메시지 생성
        const accuracy = analysisResult.accuracy || 0;
        const total = analysisResult.total_problems || 0;
        const correct = analysisResult.correct_count || 0;
        const weakest = analysisResult.weakest_area || "";

        let resultText = `📊 분석 완료!\n\n`;
        resultText += `✅ 정답: ${correct}문제\n`;
        resultText += `❌ 오답: ${total - correct}문제\n`;
        resultText += `📈 정답률: ${(accuracy * 100).toFixed(0)}%\n`;

        if (wrongProblems.length > 0) {
            resultText += `\n📝 오답 분석:\n`;
            wrongProblems.slice(0, 3).forEach((p: any) => {
                resultText += `❌ ${p.number}번: ${ERROR_TYPE_MAP[p.error_type] || "오류"}\n`;
                if (p.error_location) {
                    resultText += `   📍 ${p.error_location}\n`;
                }
                if (p.error_description) {
                    resultText += `   💡 ${p.error_description}\n`;
                }
            });
        }

        if (weakest) {
            resultText += `\n⚠️ 약점: ${weakest}`;
        }

        resultText += `\n\n오답노트에 자동 저장되었어요! 📝`;

        // 5. 카카오 Event API로 결과 푸시 (그룹 채팅인 경우)
        if (groupKey && botId) {
            await sendKakaoEventResponse(botId, groupKey, resultText);
        }

        return new Response(
            JSON.stringify({
                success: true,
                result: analysisResult,
                message: resultText,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );

    } catch (error) {
        console.error("분석 처리 오류:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error: String(error),
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
}

serve(handleAnalyzeRequest);
