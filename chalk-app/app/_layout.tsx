import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { useEffect } from 'react';
import { initializeCurriculum } from '../lib/curriculum';

export default function RootLayout() {
    useEffect(() => {
        initializeCurriculum();
    }, []);

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.bg.base },
                    animation: 'fade',
                }}
            />
        </SafeAreaProvider>
    );
}
