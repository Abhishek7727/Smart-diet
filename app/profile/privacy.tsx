import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';

const PrivacyScreen = () => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Collection & Usage</Text>
                    <Text style={[styles.text, { color: colors.text }]}>
                        Smart Diet is a privacy-first application. We do not collect, store, or share your personal data with any third-party servers. All information you enter, including your name, age, weight, and dietary preferences, is stored locally on your device using secure storage mechanisms.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Processing</Text>
                    <Text style={[styles.text, { color: colors.text }]}>
                        When you use the AI meal planner, your profile data (anonymized where possible) is sent to Google's Gemini API solely for the purpose of generating meal recommendations. This data is not retained by our application after the session ends.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Local Storage</Text>
                    <Text style={[styles.text, { color: colors.text }]}>
                        We use Redux Persist and AsyncStorage to save your preferences and meal history on your device so you don't lose your progress when you close the app. You can clear this data at any time from the Settings menu.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact</Text>
                    <Text style={[styles.text, { color: colors.text }]}>
                        If you have any questions about this Privacy Policy, please contact us at support@smartdiet.app.
                    </Text>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        opacity: 0.8,
    },
});

export default PrivacyScreen;
