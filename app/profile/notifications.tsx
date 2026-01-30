import React, { useState } from 'react';
import {
    View,
    Text,
    Switch,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const [settings, setSettings] = useState({
        mealReminders: true,
        weeklyProgress: true,
        tips: false,
        updates: true,
    });

    const toggleSwitch = (key: string) => {
        setSettings(prev => ({ ...prev, [key as keyof typeof settings]: !prev[key as keyof typeof settings] }));
    };

    const SettingItem = ({ label, settingKey }: { label: string, settingKey: string }) => (
        <View style={[styles.item, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <Switch
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={colors.surface}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleSwitch(settingKey)}
                value={settings[settingKey as keyof typeof settings]}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <SettingItem label="Meal Reminders" settingKey="mealReminders" />
                <SettingItem label="Weekly Progress Reports" settingKey="weeklyProgress" />
                <SettingItem label="Daily Health Tips" settingKey="tips" />
                <SettingItem label="App Updates" settingKey="updates" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
});
