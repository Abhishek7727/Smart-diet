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
import { ThemedBackground } from '@/components/ThemedBackground';
import { GlassCard } from '@/components/GlassCard';

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
        <ThemedBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                </View>

                <View style={styles.content}>
                    <GlassCard style={styles.card}>
                        <SettingItem label="Meal Reminders" settingKey="mealReminders" />
                        <SettingItem label="Weekly Progress Reports" settingKey="weeklyProgress" />
                        <SettingItem label="Daily Health Tips" settingKey="tips" />
                        <SettingItem label="App Updates" settingKey="updates" />
                    </GlassCard>
                </View>
            </SafeAreaView>
        </ThemedBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        padding: 24,
    },
    card: {
        padding: 16,
        borderRadius: 24,
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
