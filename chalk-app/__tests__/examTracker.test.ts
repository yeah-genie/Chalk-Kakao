// ===================================
// examTracker Unit Tests
// ===================================

import { examTracker } from '../lib/examTracker';

describe('ExamTracker', () => {
    beforeEach(() => {
        examTracker.reset();
    });

    describe('Session Management', () => {
        it('should start a session correctly', () => {
            examTracker.startSession('test-exam-1', 10);
            const session = examTracker.getSessionData();

            expect(session).not.toBeNull();
            expect(session?.examId).toBe('test-exam-1');
            expect(session?.totalQuestions).toBe(10);
            expect(session?.isCompleted).toBe(false);
        });

        it('should end a session and mark as completed', () => {
            examTracker.startSession('test-exam-2', 5);
            const session = examTracker.endSession();

            expect(session).not.toBeNull();
            expect(session?.isCompleted).toBe(true);
            expect(session?.endTime).toBeDefined();
        });

        it('should reset the tracker', () => {
            examTracker.startSession('test-exam-3', 5);
            examTracker.reset();
            const session = examTracker.getSessionData();

            expect(session).toBeNull();
        });
    });

    describe('Question Navigation', () => {
        beforeEach(() => {
            examTracker.startSession('nav-test', 5);
        });

        it('should record entering a question', () => {
            examTracker.onQuestionEnter(1);
            const event = examTracker.getQuestionEvent(1);

            expect(event).toBeDefined();
            expect(event?.questionNum).toBe(1);
            expect(event?.enterTime).toBeGreaterThan(0);
        });

        it('should track revisit count', () => {
            examTracker.onQuestionEnter(1);
            examTracker.onQuestionEnter(2);
            examTracker.onQuestionEnter(1); // Revisit

            const event = examTracker.getQuestionEvent(1);
            expect(event?.revisitCount).toBe(1);
        });

        it('should calculate time spent on questions', async () => {
            examTracker.onQuestionEnter(1);

            // Wait a bit to accumulate time
            await new Promise(resolve => setTimeout(resolve, 100));

            examTracker.onQuestionLeave(1);
            const event = examTracker.getQuestionEvent(1);

            expect(event?.timeSpentSeconds).toBeGreaterThan(0);
        });
    });

    describe('Pen Events', () => {
        beforeEach(() => {
            examTracker.startSession('pen-test', 3);
            examTracker.onQuestionEnter(1);
        });

        it('should count pen down events', () => {
            examTracker.onPenDown();
            examTracker.onPenUp();
            examTracker.onPenDown();
            examTracker.onPenUp();

            const event = examTracker.getQuestionEvent(1);
            expect(event?.penDownCount).toBe(2);
        });

        it('should track hesitation time', async () => {
            examTracker.onPenDown();
            examTracker.onPenUp();

            // Wait longer than hesitation threshold (500ms)
            await new Promise(resolve => setTimeout(resolve, 600));

            examTracker.onPenDown();
            examTracker.onPenUp();

            const event = examTracker.getQuestionEvent(1);
            expect(event?.hesitationMs).toBeGreaterThan(500);
        });
    });

    describe('Erase Events', () => {
        beforeEach(() => {
            examTracker.startSession('erase-test', 3);
            examTracker.onQuestionEnter(1);
        });

        it('should count erase events', () => {
            examTracker.onErase();
            examTracker.onErase();
            examTracker.onErase();

            const event = examTracker.getQuestionEvent(1);
            expect(event?.eraseCount).toBe(3);
        });
    });

    describe('Flag Events', () => {
        beforeEach(() => {
            examTracker.startSession('flag-test', 3);
            examTracker.onQuestionEnter(1);
        });

        it('should toggle flag state', () => {
            examTracker.onFlag();
            let event = examTracker.getQuestionEvent(1);
            expect(event?.flagged).toBe(true);

            examTracker.onFlag();
            event = examTracker.getQuestionEvent(1);
            expect(event?.flagged).toBe(false);
        });
    });

    describe('Progress Tracking', () => {
        beforeEach(() => {
            examTracker.startSession('progress-test', 5);
        });

        it('should calculate progress correctly', () => {
            examTracker.onQuestionEnter(1);
            examTracker.onQuestionEnter(2);
            examTracker.onQuestionEnter(3);

            const progress = examTracker.getProgress();

            expect(progress.completed).toBe(3);
            expect(progress.total).toBe(5);
            expect(progress.percentage).toBe(60);
        });

        it('should get all question events sorted', () => {
            examTracker.onQuestionEnter(3);
            examTracker.onQuestionEnter(1);
            examTracker.onQuestionEnter(5);

            const events = examTracker.getAllQuestionEvents();

            expect(events.length).toBe(3);
            expect(events[0].questionNum).toBe(1);
            expect(events[1].questionNum).toBe(3);
            expect(events[2].questionNum).toBe(5);
        });
    });
});
