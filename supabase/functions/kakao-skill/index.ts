// 카카오 그룹 챗봇 스킬 서버
// Supabase Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS 헤더
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 카카오 스킬 요청 타입
interface KakaoSkillRequest {
    intent: { id: string; name: string };
    userRequest: {
        user: { id: string; properties?: Record<string, any> };
        utterance: string;
        params?: Record<string, any>;
        chat?: { id: string; type: string }; // 그룹 채팅방 정보 (botGroupKey)
    };
    action: {
        id: string;
        name: string;
        params: Record<string, any>;
        clientExtra?: Record<string, any>;
    };
    bot: { id: string; name: string };
}

// 카카오 응답 컴포넌트 타입
interface SimpleText {
    simpleText: { text: string };
}

interface TextCard {
    textCard: {
        title: string;
        description: string;
        buttons?: Array<{
            label: string;
            action: "webLink" | "message" | "phone";
            webLinkUrl?: string;
            messageText?: string;
        }>;
    };
}

interface KakaoSkillResponse {
    version: "2.0";
    template: {
        outputs: Array<SimpleText | TextCard>;
    };
    data?: Record<string, any>;
}

// Supabase 클라이언트 생성
function getSupabaseClient() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    return createClient(supabaseUrl, supabaseKey);
}

// 간단한 텍스트 응답 생성
function createSimpleTextResponse(text: string): KakaoSkillResponse {
    return {
        version: "2.0",
        template: {
            outputs: [{ simpleText: { text } }],
        },
    };
}

// 카드 응답 생성
function createTextCardResponse(
    title: string,
    description: string,
    buttons?: Array<{ label: string; action: "webLink" | "message"; webLinkUrl?: string; messageText?: string }>
): KakaoSkillResponse {
    return {
        version: "2.0",
        template: {
            outputs: [
                {
                    textCard: {
                        title,
                        description,
                        buttons,
                    },
                },
            ],
        },
    };
}

// 사용자 등록/조회
async function getOrCreateUser(
    supabase: ReturnType<typeof getSupabaseClient>,
    kakaoUserId: string,
    groupId?: string
) {
    // 기존 사용자 조회
    const { data: existingUser } = await supabase
        .from("chatbot_users")
        .select("*")
        .eq("kakao_user_id", kakaoUserId)
        .single();

    if (existingUser) {
        // 마지막 활동 시간 업데이트
        await supabase
            .from("chatbot_users")
            .update({ last_active_at: new Date().toISOString() })
            .eq("id", existingUser.id);
        return existingUser;
    }

    // 새 사용자 생성
    const { data: newUser, error } = await supabase
        .from("chatbot_users")
        .insert({
            kakao_user_id: kakaoUserId,
            group_key: groupId,
        })
        .select()
        .single();

    if (error) {
        console.error("사용자 생성 실패:", error);
        return null;
    }

    return newUser;
}

// 메인 핸들러
async function handleSkillRequest(req: Request): Promise<Response> {
    // OPTIONS 요청 처리
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body: KakaoSkillRequest = await req.json();
        console.log("스킬 요청 수신:", JSON.stringify(body, null, 2));

        const supabase = getSupabaseClient();
        const userId = body.userRequest.user.id;
        const groupKey = body.userRequest.chat?.id; // 그룹 채팅방 ID
        const utterance = body.userRequest.utterance;
        const actionName = body.action.name;

        // 사용자 등록/조회
        const user = await getOrCreateUser(supabase, userId, groupKey);

        // 액션별 처리
        let response: KakaoSkillResponse;

        switch (actionName) {
            case "welcome":
                // 봇 입장 메시지
                response = createTextCardResponse(
                    "📚 Chalk 공부 인증 봇",
                    "안녕하세요! 공부 인증하고 친구들과 성장해요.\n\n" +
                    "📸 풀이 사진을 보내면 AI가 자동 분석!\n" +
                    "🏆 오늘의 공부왕 랭킹 확인\n" +
                    "📝 오답노트 자동 생성",
                    [
                        { label: "📸 공부 인증하기", action: "message", messageText: "@Chalk 인증" },
                        { label: "🏆 랭킹 보기", action: "message", messageText: "@Chalk 랭킹" },
                    ]
                );
                break;

            case "analyze":
                // 이미지 분석 요청 - 비동기 처리 필요
                // 먼저 "분석 중" 응답을 보내고, 콜백으로 결과 전송
                const imageParam = body.action.params?.image;

                if (imageParam) {
                    // analyze-homework 함수 호출 (비동기)
                    const analyzeUrl = Deno.env.get("SUPABASE_URL") + "/functions/v1/analyze-homework";

                    fetch(analyzeUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                        },
                        body: JSON.stringify({
                            imageUrl: imageParam.url || imageParam,
                            userId: user?.id,
                            groupKey,
                            kakaoUserId: userId,
                            botId: body.bot.id,
                        }),
                    }).catch(console.error);

                    response = createSimpleTextResponse(
                        "📊 분석 중입니다...\n잠시만 기다려주세요! (약 5-10초)"
                    );
                } else {
                    response = createSimpleTextResponse(
                        "📸 풀이 사진을 보내주세요!\n\n" +
                        "분석하고 싶은 문제 풀이를 사진으로 찍어 보내주시면\n" +
                        "AI가 자동으로 채점하고 오답 분석을 해드려요."
                    );
                }
                break;

            case "ranking":
                // 오늘의 랭킹 조회
                if (groupKey) {
                    const today = new Date().toISOString().split("T")[0];

                    const { data: rankings } = await supabase
                        .from("daily_certifications")
                        .select(`
              user_id,
              accuracy,
              total_problems,
              chatbot_users!inner(nickname, kakao_user_id)
            `)
                        .eq("group_key", groupKey)
                        .gte("created_at", today)
                        .order("accuracy", { ascending: false })
                        .limit(10);

                    if (rankings && rankings.length > 0) {
                        const medals = ["🥇", "🥈", "🥉"];
                        let rankText = "🏆 오늘의 공부왕 랭킹\n\n";

                        rankings.forEach((r: any, i: number) => {
                            const medal = medals[i] || `${i + 1}.`;
                            const name = r.chatbot_users?.nickname || `학생${i + 1}`;
                            rankText += `${medal} ${name} - ${(r.accuracy * 100).toFixed(0)}% (${r.total_problems}문제)\n`;
                        });

                        response = createSimpleTextResponse(rankText);
                    } else {
                        response = createSimpleTextResponse(
                            "아직 오늘 인증한 사람이 없어요!\n\n" +
                            "📸 문제 풀이 사진을 올려서 첫 번째 공부왕이 되어보세요!"
                        );
                    }
                } else {
                    response = createSimpleTextResponse("그룹 채팅방에서만 랭킹을 확인할 수 있어요!");
                }
                break;

            case "wrong_notes":
                // 오답노트 조회
                if (user) {
                    const { data: wrongAnswers } = await supabase
                        .from("wrong_answers")
                        .select("*")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false })
                        .limit(5);

                    if (wrongAnswers && wrongAnswers.length > 0) {
                        let noteText = "📝 최근 오답노트\n\n";

                        wrongAnswers.forEach((w: any, i: number) => {
                            noteText += `❌ ${i + 1}. ${w.error_type || "오류"}\n`;
                            noteText += `   ${w.error_location || ""}\n`;
                            if (w.error_description) {
                                noteText += `   💡 ${w.error_description}\n`;
                            }
                            noteText += "\n";
                        });

                        response = createSimpleTextResponse(noteText);
                    } else {
                        response = createSimpleTextResponse(
                            "아직 오답노트가 비어있어요!\n\n" +
                            "📸 문제 풀이를 인증하면 자동으로 오답이 기록됩니다."
                        );
                    }
                } else {
                    response = createSimpleTextResponse("오답노트를 확인할 수 없습니다.");
                }
                break;

            default:
                // 기본 응답
                response = createSimpleTextResponse(
                    "무엇을 도와드릴까요?\n\n" +
                    "📸 인증 - 풀이 사진 분석\n" +
                    "🏆 랭킹 - 오늘의 공부왕\n" +
                    "📝 오답 - 내 오답노트"
                );
        }

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("스킬 처리 오류:", error);

        return new Response(
            JSON.stringify(createSimpleTextResponse("죄송합니다, 오류가 발생했어요. 다시 시도해주세요.")),
            {
                status: 200, // 카카오는 200 응답 필요
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
}

serve(handleSkillRequest);
