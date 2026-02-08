import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function scheduleDailyReminders() {
    // 1. Request permissions first
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('Permission for notifications was not granted. Please enable them in settings.');
        return false;
    }

    // 2. Cancel existing to avoid duplicates
    await cancelAllReminders();

    // 3. Schedule Daily Meals
    // Breakfast: 8:00 AM
    await scheduleNotification('Breakfast Reminder', 'Start your day right! Log your breakfast now.', 8, 0);

    // Lunch: 1:00 PM (13:00)
    await scheduleNotification('Lunch Reminder', 'Fuel up for the afternoon. Don\'t forget to log lunch!', 13, 0);

    // Snacks: 4:30 PM (16:30)
    await scheduleNotification('Snack Time', 'Need a boost? Log your healthy snack.', 16, 30);

    // Dinner: 8:00 PM (20:00)
    await scheduleNotification('Dinner Reminder', 'Time to wind down using smart diet. Log your dinner.', 20, 0);

    return true;
}

export async function cancelAllReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

async function scheduleNotification(title: string, body: string, hour: number, minute: number) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: {
            hour,
            minute,
            repeats: true,
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        },
    });
}

// Helper to check if notifications are currently scheduled (to set initial toggle state)
export async function areRemindersScheduled(): Promise<boolean> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length > 0;
}
