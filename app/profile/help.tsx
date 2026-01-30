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

export default function HelpScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
        <View style={[styles.faqItem, { backgroundColor: colors.surfaceHighlight }]}>
            <Text style={[styles.question, { color: colors.text }]}>{question}</Text>
            <Text style={[styles.answer, { color: colors.icon }]}>{answer}</Text>
        </View>
    );

    const handleContactSupport = () => {
        Linking.openURL('mailto:support@smartdiet.com?subject=Support Request');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>

                <FAQItem
                    question="How does the AI recommendation work?"
                    answer="Our AI analyzes your profile, goals, and dietary preferences to suggest personalized meal options powered by Google Gemini."
                />
                <FAQItem
                    question="Can I use the app offline?"
                    answer="Yes! Local recommendations are available offline, but AI generation requires an internet connection."
                />
                <FAQItem
                    question="Is my data private?"
                    answer="Absolutely. All your personal data is stored locally on your device."
                />

                <View style={styles.contactSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Need more help?</Text>
                    <TouchableOpacity
                        style={[styles.contactButton, { backgroundColor: colors.primary }]}
                        onPress={handleContactSupport}
                    >
                        <Ionicons name="mail" size={20} color="white" />
                        <Text style={styles.contactButtonText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.version, { color: colors.icon }]}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    faqItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        lineHeight: 20,
    },
    contactSection: {
        marginTop: 20,
        alignItems: 'center',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 24,
        marginTop: 10,
    },
    contactButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 12,
    },
});
