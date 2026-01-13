// 카카오 챗봇 분석 스킬 API
// 이 파일이 카카오 챗봇과 Gemini AI를 연결하는 "다리" 역할을 해요

import { NextRequest, NextResponse } from "next/server";
import { KakaoSkillRequest, KakaoSkillResponse } from "../types";
import { analyzeExamImage, formatAnalysisMessage } from "@/lib/gemini";

/**
 * POST /api/kakao/analyze
 * 
 * 동작 흐름:
 * 1. 카카오 챗봇이 사용자의 이미지 URL과 함께 요청을 보냄
 * 2. 우리 서버가 Gemini AI로 이미지 분석
 * 3. 분석 결과를 카카오 응답 형식으로 변환해서 반환
 * 4. 카카오 챗봇이 사용자에게 결과 메시지 표시
 */
export async function POST(request: NextRequest) {
    try {
        // 1. 카카오에서 보낸 요청 파싱
        const body: KakaoSkillRequest = await request.json();

        // 로그 (디버깅용)
        console.log("=== 카카오 스킬 요청 ===");
        console.log("사용자:", body.userRequest.user.id);
        console.log("발화:", body.userRequest.utterance);
        console.log("파라미터:", body.action.params);

        // 2. 이미지 URL 추출
        // detailParams에서 secureimage 플러그인으로 받은 이미지 URL 찾기
        let imageUrl: string | null = null;

        // 헬퍼 함수: 배열이면 첫 번째 요소, 아니면 그대로 반환
        const extractUrl = (value: unknown): string | null => {
            if (!value) return null;
            if (Array.isArray(value)) {
                return value[0] || null;
            }
            if (typeof value === 'string') {
                return value;
            }
            if (typeof value === 'object' && value !== null) {
                const obj = value as Record<string, unknown>;
                return extractUrl(obj.origin) || extractUrl(obj.value) || extractUrl(obj.url);
            }
            return null;
        };

        // 방법 1: detailParams에서 찾기
        if (body.action.detailParams) {
            const imageParam = body.action.detailParams["이미지"] ||
                body.action.detailParams["image"];
            if (imageParam) {
                imageUrl = extractUrl(imageParam.origin) || extractUrl(imageParam.value);
            }
        }

        // 방법 2: params에서 직접 찾기
        if (!imageUrl && body.action.params) {
            imageUrl = extractUrl(body.action.params["이미지"]) ||
                extractUrl(body.action.params["image"]) ||
                extractUrl(body.action.params["secureimage"]);
        }

        console.log("추출된 이미지 URL:", imageUrl);

        // 이미지가 없으면 안내 메시지
        if (!imageUrl) {
            return NextResponse.json<KakaoSkillResponse>({
                version: "2.0",
                template: {
                    outputs: [
                        {
                            simpleText: {
                                text: "📸 시험지 사진을 함께 보내주세요!\n\n사진을 첨부한 후 \"분석해줘\"라고 말해주세요."
                            }
                        }
                    ],
                    quickReplies: [
                        {
                            messageText: "도움말",
                            action: "message",
                            label: "📚 사용법 보기"
                        }
                    ]
                }
            });
        }

        console.log("이미지 URL:", imageUrl);

        // 3. Gemini Vision으로 이미지 분석
        const analysisResult = await analyzeExamImage(imageUrl);

        console.log("분석 결과:", analysisResult);

        // 4. 결과 메시지 생성
        const messageText = formatAnalysisMessage(analysisResult);

        // 5. 카카오 응답 형식으로 반환
        const response: KakaoSkillResponse = {
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: messageText
                        }
                    }
                ],
                quickReplies: [
                    {
                        messageText: "내 기록",
                        action: "message",
                        label: "📊 내 기록 보기"
                    },
                    {
                        messageText: "분석해줘",
                        action: "message",
                        label: "📸 다시 분석하기"
                    }
                ]
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("스킬 서버 오류:", error);

        // 오류 발생 시 친절한 안내
        return NextResponse.json<KakaoSkillResponse>({
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: "⚠️ 분석 중 오류가 발생했어요.\n\n잠시 후 다시 시도해주세요!"
                        }
                    }
                ],
                quickReplies: [
                    {
                        messageText: "분석해줘",
                        action: "message",
                        label: "🔄 다시 시도"
                    }
                ]
            }
        });
    }
}

// GET: API 상태 확인 (테스트용)
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "Chalk Kakao Analyze API is running!",
        usage: "Send POST request with Kakao skill format",
        timestamp: new Date().toISOString()
    });
}
