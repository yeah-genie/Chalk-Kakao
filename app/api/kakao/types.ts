// Kakao Chatbot Skill Server - Types
// 카카오 챗봇이 보내는 요청과 우리가 보내는 응답의 형식을 정의해요

/**
 * 카카오 챗봇이 스킬 서버로 보내는 요청 형식
 * (쉽게 말하면: 사용자가 뭘 말했는지, 어떤 정보를 보냈는지 담긴 데이터)
 */
export interface KakaoSkillRequest {
    intent: {
        id: string;
        name: string;  // 블록 이름 (예: "분석")
    };
    userRequest: {
        timezone: string;
        params: {
            ignoreMe?: string;
            surface?: string;
        };
        block: {
            id: string;
            name: string;
        };
        utterance: string;  // 사용자가 말한 내용 (예: "분석해줘")
        lang: string;
        user: {
            id: string;  // 사용자 고유 ID
            type: string;
            properties: Record<string, string>;
        };
    };
    bot: {
        id: string;
        name: string;
    };
    action: {
        name: string;
        clientExtra: Record<string, unknown> | null;
        params: Record<string, string>;  // 파라미터 (이미지 URL 등)
        id: string;
        detailParams: Record<string, {
            origin: string;
            value: string;
            groupName?: string;
        }>;
    };
}

/**
 * 스킬 서버가 카카오 챗봇에게 보내는 응답 형식
 * (쉽게 말하면: 사용자에게 보여줄 메시지를 담은 데이터)
 */
export interface KakaoSkillResponse {
    version: "2.0";
    template: {
        outputs: KakaoOutput[];
        quickReplies?: KakaoQuickReply[];
    };
}

// 텍스트 응답
export interface KakaoSimpleText {
    simpleText: {
        text: string;  // 최대 1000자
    };
}

// 이미지 응답
export interface KakaoSimpleImage {
    simpleImage: {
        imageUrl: string;
        altText: string;
    };
}

// 카드 응답 (버튼 포함 가능)
export interface KakaoBasicCard {
    basicCard: {
        title?: string;
        description?: string;
        thumbnail?: {
            imageUrl: string;
        };
        buttons?: KakaoButton[];
    };
}

export type KakaoOutput = KakaoSimpleText | KakaoSimpleImage | KakaoBasicCard;

// 버튼
export interface KakaoButton {
    action: "message" | "webLink" | "phone";
    label: string;
    messageText?: string;
    webLinkUrl?: string;
    phoneNumber?: string;
}

// 빠른 응답 버튼 (하단에 표시)
export interface KakaoQuickReply {
    messageText: string;
    action: "message" | "block";
    label: string;
    blockId?: string;
}

/**
 * Gemini Vision이 분석한 결과 형식
 */
export interface ExamAnalysisResult {
    subject: "수학" | "국어" | "영어" | "과학" | "사회" | "기타";
    score?: number | null;
    totalScore?: number | null;
    errors: {
        questionNumber: number | string;
        studentAnswer?: string;    // 학생이 쓴 답
        correctAnswer?: string;    // 정답
        errorType: string;
        description: string;
    }[];
    insights?: string;
    potentialScore?: number;  // 실수 없었으면 받았을 점수
}

