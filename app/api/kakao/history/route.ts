// 카카오 챗봇 히스토리 스킬 API
// 사용자의 과거 분석 기록을 보여주는 API

import { NextRequest, NextResponse } from "next/server";
import { KakaoSkillRequest, KakaoSkillResponse } from "../types";

/**
 * POST /api/kakao/history
 * 
 * 동작 흐름:
 * 1. 카카오 챗봇이 사용자 ID와 함께 요청
 * 2. DB에서 해당 사용자의 분석 기록 조회 (TODO: Supabase 연동)
 * 3. 기록을 카카오 응답 형식으로 반환
 */
export async function POST(request: NextRequest) {
    try {
        const body: KakaoSkillRequest = await request.json();

        const userId = body.userRequest.user.id;
        console.log("히스토리 요청 - 사용자:", userId);

        // TODO: Supabase에서 사용자 기록 조회
        // const { data: records } = await supabase
        //   .from('exam_analyses')
        //   .select('*')
        //   .eq('kakao_user_id', userId)
        //   .order('created_at', { ascending: false })
        //   .limit(5);

        // MVP에서는 임시 메시지 반환
        const response: KakaoSkillResponse = {
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: `📋 분석 기록\n\n아직 분석 기록이 없어요!\n\n📸 시험지나 숙제 사진을 보내서\n첫 번째 분석을 시작해보세요!`
                        }
                    }
                ],
                quickReplies: [
                    {
                        messageText: "분석해줘",
                        action: "message",
                        label: "📸 시험 분석하기"
                    },
                    {
                        messageText: "도움말",
                        action: "message",
                        label: "📚 사용법"
                    }
                ]
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("히스토리 API 오류:", error);

        return NextResponse.json<KakaoSkillResponse>({
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: "⚠️ 기록을 불러오는 중 오류가 발생했어요."
                        }
                    }
                ]
            }
        });
    }
}
