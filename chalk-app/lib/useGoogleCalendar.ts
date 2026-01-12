import { useEffect, useState, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// ===================================
// GOOGLE CALENDAR INTEGRATION
// Zero-Action: 수업 일정 자동 동기화
// ===================================

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const STORAGE_KEY = '@chalk_google_tokens';

interface GoogleTokens {
    access_token: string;
    refresh_token?: string;
    expires_at: number;
}

interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: { dateTime: string };
    end: { dateTime: string };
    attendees?: Array<{ email: string; displayName?: string }>;
}

export function useGoogleCalendar() {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [error, setError] = useState<string | null>(null);

    // 저장된 토큰 로드
    useEffect(() => {
        loadStoredTokens();
    }, []);

    const loadStoredTokens = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const tokens: GoogleTokens = JSON.parse(stored);
                if (tokens.expires_at > Date.now()) {
                    setIsConnected(true);
                    console.log('[Google] Loaded stored credentials');
                } else {
                    // 토큰 만료됨 - 갱신 필요
                    await refreshAccessToken(tokens.refresh_token);
                }
            }
        } catch (err) {
            console.log('[Google] No stored credentials');
        }
    };

    // OAuth 연결
    const connect = useCallback(async () => {
        if (!GOOGLE_CLIENT_ID) {
            setError('Google Client ID가 설정되지 않았습니다');
            console.log('[Google] Demo mode - no client ID');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const redirectUri = AuthSession.makeRedirectUri({
                scheme: 'chalk',
            });

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${GOOGLE_CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                `&response_type=code` +
                `&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly')}` +
                `&access_type=offline` +
                `&prompt=consent`;

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

            if (result.type === 'success' && result.url) {
                const params = new URL(result.url).searchParams;
                const code = params.get('code');

                if (code) {
                    await exchangeCodeForTokens(code, redirectUri);
                }
            }
        } catch (err) {
            setError('구글 연결에 실패했습니다');
            console.error('[Google] Auth error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 코드를 토큰으로 교환 (Supabase Edge Function 사용)
    const exchangeCodeForTokens = async (code: string, redirectUri: string) => {
        const { data, error } = await supabase.functions.invoke('google-auth', {
            body: { code, redirectUri },
        });

        if (error) throw error;

        const tokens: GoogleTokens = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + (data.expires_in * 1000),
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
        setIsConnected(true);
    };

    // 토큰 갱신
    const refreshAccessToken = async (refreshToken?: string) => {
        if (!refreshToken) {
            setIsConnected(false);
            return;
        }

        try {
            const { data, error } = await supabase.functions.invoke('google-auth', {
                body: { refreshToken },
            });

            if (error) throw error;

            const tokens: GoogleTokens = {
                access_token: data.access_token,
                refresh_token: refreshToken,
                expires_at: Date.now() + (data.expires_in * 1000),
            };

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
            setIsConnected(true);
        } catch (err) {
            console.error('[Google] Token refresh failed:', err);
            setIsConnected(false);
        }
    };

    // 캘린더 이벤트 가져오기
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (!stored) {
                throw new Error('Not connected');
            }

            const tokens: GoogleTokens = JSON.parse(stored);

            const timeMin = new Date().toISOString();
            const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
                `timeMin=${encodeURIComponent(timeMin)}&` +
                `timeMax=${encodeURIComponent(timeMax)}&` +
                `singleEvents=true&orderBy=startTime`,
                {
                    headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data.items || []);

            // 수업 일정만 필터링해서 앱에 저장
            await syncEventsToApp(data.items || []);

        } catch (err) {
            setError('캘린더 동기화에 실패했습니다');
            console.error('[Google] Fetch events error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 캘린더 이벤트를 앱 세션으로 동기화
    const syncEventsToApp = async (calendarEvents: CalendarEvent[]) => {
        // 수업 관련 이벤트만 필터링 (예: 제목에 '수업', 'lesson', '과외' 포함)
        const lessonKeywords = ['수업', 'lesson', '과외', 'tutoring', 'class'];

        const lessonEvents = calendarEvents.filter(event =>
            lessonKeywords.some(keyword =>
                event.summary?.toLowerCase().includes(keyword.toLowerCase())
            )
        );

        console.log(`[Google] Found ${lessonEvents.length} lesson events`);

        // TODO: Supabase에 세션으로 저장
        // 이 부분은 Supabase 스키마가 준비되면 구현
    };

    // 연결 해제
    const disconnect = useCallback(async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setIsConnected(false);
        setEvents([]);
    }, []);

    return {
        isConnected,
        isLoading,
        events,
        error,
        connect,
        disconnect,
        fetchEvents,
    };
}
