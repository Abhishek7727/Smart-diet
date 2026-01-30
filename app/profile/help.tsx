import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    useColorScheme,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ThemedBackground } from '@/components/ThemedBackground';
import { GlassCard } from '@/components/GlassCard';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function HelpScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
        <View style={[styles.faqItem, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.question, { color: colors.text }]}>{question}</Text>
            <Text style={[styles.answer, { color: colors.icon }]}>{answer}</Text>
        </View>
    );

    const handleContactSupport = () => {
        Linking.openURL('mailto:support@smartdiet.com?subject=Support Request');
    };

    return (
        <ThemedBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>

                    <GlassCard style={styles.card}>
                        <FAQItem
                            question="How does the AI recommendation work?"
                            answer="Our AI analyzes your profile, goals, and dietary preferences to suggest personalized meal options powered by Google Gemini."
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <FAQItem
                            question="Can I use the app offline?"
                            answer="Yes! Local recommendations are available offline, but AI generation requires an internet connection."
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <FAQItem
                            question="Is my data private?"
                            answer="Absolutely. All your personal data is stored locally on your device."
                        />
                    </GlassCard>

                    <View style={styles.contactSection}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Need more help?</Text>
                        <PrimaryButton
                            title="Contact Support"
                            onPress={handleContactSupport}
                            style={styles.contactButton}
                        />
                    </View>

                    <Text style={[styles.version, { color: colors.icon }]}>Version 1.0.0</Text>
                </ScrollView>
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
        gap: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    card: {
        padding: 16,
    },
    faqItem: {
        padding: 8,
        marginBottom: 8,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    answer: {
        fontSize: 14,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginVertical: 8,
        opacity: 0.5,
    },
    contactSection: {
        marginTop: 20,
        alignItems: 'center',
        gap: 16,
        width: '100%',
    },
    contactButton: {
        width: '100%',
    },
    version: {
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 40,
        fontSize: 12,
    },
});
