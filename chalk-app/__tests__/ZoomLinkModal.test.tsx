import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ZoomLinkModal from '../components/ZoomLinkModal';

// Supabase mock
jest.mock('../lib/supabase', () => ({
    supabase: {
        functions: {
            invoke: jest.fn(),
        },
    },
}));

describe('ZoomLinkModal', () => {
    it('renders correctly when visible', () => {
        const { getByText, getByPlaceholderText } = render(
            <ZoomLinkModal visible={true} onClose={() => { }} />
        );

        expect(getByText('Zoom 수업 연결 🎥')).toBeTruthy();
        expect(getByPlaceholderText('https://zoom.us/j/123456789')).toBeTruthy();
    });

    it('shows error message when submitting empty URL', () => {
        const { getByText } = render(
            <ZoomLinkModal visible={true} onClose={() => { }} />
        );

        const submitButton = getByText('봇 참가시키기');
        fireEvent.press(submitButton);

        expect(getByText('Zoom 링크를 입력해주세요')).toBeTruthy();
    });

    it('calls onClose when cancel button is pressed', () => {
        const onCloseMock = jest.fn();
        const { getByText } = render(
            <ZoomLinkModal visible={true} onClose={onCloseMock} />
        );

        const cancelButton = getByText('취소');
        fireEvent.press(cancelButton);

        expect(onCloseMock).toHaveBeenCalled();
    });
});
