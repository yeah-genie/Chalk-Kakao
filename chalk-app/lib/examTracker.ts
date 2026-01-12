// ===================================
// ESIP: Exam Tracker
// 시험 풀이 행동 데이터 수집기
// ===================================

// ===================================
// TYPES
// ===================================

export interface QuestionEvent {
    questionNum: number;
    enterTime: number;
    leaveTime?: number;
    timeSpentSeconds: number;
    penDownCount: number;
    hesitationMs: number;  // Total pen hover/pause time
    eraseCount: number;
    revisitCount: number;
    flagged: boolean;
    answerChangedCount: number;
}

export interface ExamSession {
    examId: string;
    startTime: number;
    endTime?: number;
    totalQuestions: number;
    currentQuestion: number;
    questionEvents: Map<number, QuestionEvent>;
    isCompleted: boolean;
}

// ===================================
// EXAM TRACKER CLASS
// ===================================

class ExamTracker {
    private session: ExamSession | null = null;
    private penDownTime: number | null = null;
    private lastPenUpTime: number | null = null;

    // ===================================
    // SESSION MANAGEMENT
    // ===================================

    startSession(examId: string, totalQuestions: number): void {
        this.session = {
            examId,
            startTime: performance.now(),
            totalQuestions,
            currentQuestion: 0,
            questionEvents: new Map(),
            isCompleted: false,
        };
        console.log(`[ExamTracker] Session started: ${examId}`);
    }

    endSession(): ExamSession | null {
        if (!this.session) return null;

        this.session.endTime = performance.now();
        this.session.isCompleted = true;

        // Ensure current question is finished
        if (this.session.currentQuestion > 0) {
            this.onQuestionLeave(this.session.currentQuestion);
        }

        console.log(`[ExamTracker] Session ended: ${this.session.examId}`);
        return this.session;
    }

    // ===================================
    // QUESTION NAVIGATION
    // ===================================

    onQuestionEnter(questionNum: number): void {
        if (!this.session) {
            console.warn('[ExamTracker] No active session');
            return;
        }

        // Leave previous question if any
        if (this.session.currentQuestion > 0 && this.session.currentQuestion !== questionNum) {
            this.onQuestionLeave(this.session.currentQuestion);
        }

        const existingEvent = this.session.questionEvents.get(questionNum);

        if (existingEvent) {
            // Revisiting this question
            existingEvent.revisitCount++;
            existingEvent.enterTime = performance.now();
            console.log(`[ExamTracker] Revisiting Q${questionNum} (${existingEvent.revisitCount} times)`);
        } else {
            // First time entering this question
            const newEvent: QuestionEvent = {
                questionNum,
                enterTime: performance.now(),
                timeSpentSeconds: 0,
                penDownCount: 0,
                hesitationMs: 0,
                eraseCount: 0,
                revisitCount: 0,
                flagged: false,
                answerChangedCount: 0,
            };
            this.session.questionEvents.set(questionNum, newEvent);
            console.log(`[ExamTracker] Entered Q${questionNum}`);
        }

        this.session.currentQuestion = questionNum;
    }

    onQuestionLeave(questionNum: number): void {
        if (!this.session) return;

        const event = this.session.questionEvents.get(questionNum);
        if (!event) return;

        event.leaveTime = performance.now();
        const additionalTime = (event.leaveTime - event.enterTime) / 1000;
        event.timeSpentSeconds += additionalTime;

        console.log(`[ExamTracker] Left Q${questionNum}, spent ${additionalTime.toFixed(1)}s (total: ${event.timeSpentSeconds.toFixed(1)}s)`);
    }

    // ===================================
    // PEN EVENTS
    // ===================================

    onPenDown(): void {
        if (!this.session) return;

        this.penDownTime = performance.now();

        const event = this.session.questionEvents.get(this.session.currentQuestion);
        if (event) {
            event.penDownCount++;

            // Calculate hesitation if there was a previous pen up
            if (this.lastPenUpTime) {
                const hesitation = this.penDownTime - this.lastPenUpTime;
                // Only count as hesitation if > 500ms pause
                if (hesitation > 500) {
                    event.hesitationMs += hesitation;
                }
            }
        }
    }

    onPenUp(): void {
        if (!this.session) return;
        this.lastPenUpTime = performance.now();
    }

    // ===================================
    // OTHER EVENTS
    // ===================================

    onErase(): void {
        if (!this.session) return;

        const event = this.session.questionEvents.get(this.session.currentQuestion);
        if (event) {
            event.eraseCount++;
            console.log(`[ExamTracker] Erased on Q${this.session.currentQuestion} (${event.eraseCount} times)`);
        }
    }

    onFlag(questionNum?: number): void {
        if (!this.session) return;

        const qNum = questionNum ?? this.session.currentQuestion;
        const event = this.session.questionEvents.get(qNum);
        if (event) {
            event.flagged = !event.flagged;
            console.log(`[ExamTracker] Q${qNum} flagged: ${event.flagged}`);
        }
    }

    onAnswerChanged(): void {
        if (!this.session) return;

        const event = this.session.questionEvents.get(this.session.currentQuestion);
        if (event) {
            event.answerChangedCount++;
        }
    }

    // ===================================
    // DATA ACCESS
    // ===================================

    getCurrentQuestion(): number {
        return this.session?.currentQuestion ?? 0;
    }

    getSessionData(): ExamSession | null {
        return this.session;
    }

    getQuestionEvent(questionNum: number): QuestionEvent | undefined {
        return this.session?.questionEvents.get(questionNum);
    }

    getAllQuestionEvents(): QuestionEvent[] {
        if (!this.session) return [];
        return Array.from(this.session.questionEvents.values()).sort(
            (a, b) => a.questionNum - b.questionNum
        );
    }

    getTotalTimeSpent(): number {
        if (!this.session) return 0;
        return this.getAllQuestionEvents().reduce((sum, e) => sum + e.timeSpentSeconds, 0);
    }

    getProgress(): { completed: number; total: number; percentage: number } {
        if (!this.session) return { completed: 0, total: 0, percentage: 0 };

        const completed = this.session.questionEvents.size;
        const total = this.session.totalQuestions;
        const percentage = Math.round((completed / total) * 100);

        return { completed, total, percentage };
    }

    // ===================================
    // UTILITY
    // ===================================

    reset(): void {
        this.session = null;
        this.penDownTime = null;
        this.lastPenUpTime = null;
        console.log('[ExamTracker] Reset');
    }
}

// Export singleton instance
export const examTracker = new ExamTracker();
