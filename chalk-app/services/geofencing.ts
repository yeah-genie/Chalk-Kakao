import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { scheduleLessonReminder } from './notifications';

// ===================================
// GEOFENCING SERVICE
// ===================================

const GEOFENCE_TASK_NAME = 'CHALK_GEOFENCE_TASK';

// Define geofence task
TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('Geofence error:', error);
        return;
    }

    if (data) {
        const { eventType, region } = data as any;
        console.log('Geofence event:', eventType, region);

        if (eventType === Location.GeofencingEventType.Enter) {
            // User entered a lesson location
            console.log('User entered lesson location:', region.identifier);

            // TODO: Show notification to start recording
            // This would trigger a local notification prompting to start recording
        }
    }
});

// Request location permissions
export async function requestLocationPermissions() {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return false;
    }

    // Request background permissions for geofencing
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== 'granted') {
        console.log('Background location permission denied');
        return false;
    }

    return true;
}

// Add a geofenced location for a student's lesson place
export async function addLessonLocation(
    studentId: string,
    studentName: string,
    latitude: number,
    longitude: number,
    radius: number = 100 // meters
) {
    const hasPermission = await requestLocationPermissions();

    if (!hasPermission) {
        console.log('Location permissions not granted');
        return false;
    }

    try {
        await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, [
            {
                identifier: studentId,
                latitude,
                longitude,
                radius,
                notifyOnEnter: true,
                notifyOnExit: false,
            },
        ]);

        console.log(`Added geofence for ${studentName}`);
        return true;
    } catch (error) {
        console.error('Failed to add geofence:', error);
        return false;
    }
}

// Remove a geofenced location
export async function removeLessonLocation(studentId: string) {
    try {
        const regions = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK_NAME);

        if (regions) {
            await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
            console.log(`Removed geofence for ${studentId}`);
        }
    } catch (error) {
        console.error('Failed to remove geofence:', error);
    }
}

// Get current location
export async function getCurrentLocation() {
    const hasPermission = await requestLocationPermissions();

    if (!hasPermission) {
        return null;
    }

    try {
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        console.error('Failed to get current location:', error);
        return null;
    }
}

// Check if geofencing is available
export async function isGeofencingAvailable() {
    return await Location.hasServicesEnabledAsync();
}
