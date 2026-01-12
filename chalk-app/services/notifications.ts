import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ===================================
// PUSH NOTIFICATIONS SERVICE
// ===================================

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#10b981',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Push token:', token);
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

// Schedule a local notification for lesson reminder
export async function scheduleLessonReminder(
    studentName: string,
    lessonTime: Date,
    studentId: string
) {
    // Remind 10 minutes before
    const triggerTime = new Date(lessonTime.getTime() - 10 * 60 * 1000);

    if (triggerTime <= new Date()) {
        console.log('Lesson time has passed, not scheduling reminder');
        return null;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: '📚 Lesson Starting Soon',
            body: `${studentName}'s lesson starts in 10 minutes. Ready to start recording?`,
            data: { studentId, action: 'start_recording' },
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerTime,
        },
    });

    console.log('Scheduled reminder:', identifier);
    return identifier;
}

// Cancel a scheduled notification
export async function cancelLessonReminder(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Cancel all scheduled notifications
export async function cancelAllReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

// Listen for notification responses (when user taps notification)
export function addNotificationResponseListener(
    handler: (response: Notifications.NotificationResponse) => void
) {
    return Notifications.addNotificationResponseReceivedListener(handler);
}

// Send immediate notification (for testing)
export async function sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🎉 Chalk is ready!',
            body: 'Push notifications are working.',
        },
        trigger: null, // Immediate
    });
}
