import React from 'react';
import { ScrollView, StyleSheet, Text, View, Linking, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { GlassCard } from '@/components/GlassCard';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';

const HelpScreen = () => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const faqItems = [
        {
            question: "How are my calories calculated?",
            answer: "We use the Mifflin-St Jeor equation based on your age, gender, weight, height, and activity level to calculate your BMR and TDEE."
        },
        {
            question: "Can I update my dietary preferences?",
            answer: "Yes! Go to Profile > Edit Profile to update your dietary restrictions and allergies."
        },
        {
            question: "How does the AI meal planner work?",
            answer: "Our AI analyzes your profile and nutritional needs to generate personalized meal suggestions using the Gemini API."
        },
        {
            question: "Is my data private?",
            answer: "Yes. All your personal data is stored locally on your device. We do not store your data on external servers."
        }
    ];

    const handleEmailSupport = () => {
        Linking.openURL('mailto:anamdev168@gmail.com');
    };

    return (
        <>
         <Stack.Screen options={{headerShown: false}}/>
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
                <TouchableOpacity onPress={handleEmailSupport}>
                    <GlassCard style={styles.contactCard}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="mail" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={[styles.contactTitle, { color: colors.text }]}>Email Support</Text>
                            <Text style={[styles.contactSubtitle, { color: colors.icon }]}>Get help with your account</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                    </GlassCard>
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Frequently Asked Questions</Text>
                <View style={styles.faqContainer}>
                    {faqItems.map((item, index) => (
                        <GlassCard key={index} style={styles.faqCard}>
                            <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
                            <Text style={[styles.answer, { color: colors.icon }]}>{item.answer}</Text>
                        </GlassCard>
                    ))}
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
        </>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        marginLeft: 4,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    contactSubtitle: {
        fontSize: 14,
    },
    faqContainer: {
        gap: 16,
    },
    faqCard: {
        padding: 16,
        borderRadius: 20,
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
});

export default HelpScreen;
