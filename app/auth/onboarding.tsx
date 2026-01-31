import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { updateProfile, setOnboardingCompleted } from '@/store/userSlice';
import { Colors } from '@/constants/Colors';
import { ThemedBackground } from '@/components/ThemedBackground';
import { GlassInput } from '@/components/GlassInput';
import { GlassCard } from '@/components/GlassCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';

// Types for selection
type Gender = 'Male' | 'Female' | 'Other';
type Goal = 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle' | 'improve_health';
type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';

export default function OnboardingScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        age: '',
        gender: 'Male' as Gender,
        weight: '',
        height: '',
        activityLevel: 'moderately_active' as ActivityLevel,
        goal: 'lose_weight' as Goal,
        dietaryRestrictions: [] as string[],
        allergies: [] as string[],
    });

    const totalSteps = 3;

    const handleNext = () => {
        if (step === 1) {
            if (!formData.age || !formData.weight || !formData.height) {
                Alert.alert('Missing Info', 'Please fill in all physical details.');
                return;
            }
        }
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            finishOnboarding();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const calculateTargetCalories = () => {
        // Basic BMR Calculation (Mifflin-St Jeor)
        const weight = parseFloat(formData.weight); // kg
        const height = parseFloat(formData.height); // cm
        const age = parseFloat(formData.age);

        let bmr = 10 * weight + 6.25 * height - 5 * age;
        if (formData.gender === 'Male') bmr += 5;
        else bmr -= 161;

        // Activity Multiplier
        const multipliers: Record<ActivityLevel, number> = {
            sedentary: 1.2,
            lightly_active: 1.375,
            moderately_active: 1.55,
            very_active: 1.725,
            extra_active: 1.9,
        };

        let tdee = bmr * multipliers[formData.activityLevel];

        // Goal Adjustment
        if (formData.goal === 'lose_weight') tdee -= 500;
        else if (formData.goal === 'gain_weight' || formData.goal === 'build_muscle') tdee += 500;

        return Math.round(tdee).toString();
    };

    const finishOnboarding = () => {
        const targetCalories = calculateTargetCalories();

        dispatch(updateProfile({
            ...formData,
            targetCalories,
            // For arrays, ensure we pass them correctly if the slice expects them
            dietaryRestrictions: formData.dietaryRestrictions,
            allergies: formData.allergies,
        }));

        dispatch(setOnboardingCompleted());
        router.replace('/(tabs)');
    };

    const updateField = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const toggleSelection = (key: 'dietaryRestrictions' | 'allergies', item: string) => {
        setFormData(prev => {
            const list = prev[key];
            if (list.includes(item)) {
                return { ...prev, [key]: list.filter(i => i !== item) };
            } else {
                return { ...prev, [key]: [...list, item] };
            }
        });
    };

    const SelectionCard = ({
        title,
        selected,
        onPress,
        subtitle
    }: {
        title: string;
        selected: boolean;
        onPress: () => void;
        subtitle?: string;
    }) => (
        <TouchableOpacity onPress={onPress}>
            <GlassCard style={{
                backgroundColor: selected ? colors.primary + '20' : undefined,
                borderColor: selected ? colors.primary : colors.border,
                borderWidth: 1,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            color: selected ? colors.primary : colors.text,
                            fontWeight: '600',
                            fontSize: 16
                        }}>{title}</Text>
                        {subtitle && <Text style={{ color: colors.icon, fontSize: 12, marginTop: 4 }}>{subtitle}</Text>}
                    </View>
                    {selected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                </View>
            </GlassCard>
        </TouchableOpacity>
    );

    return (
        <ThemedBackground>
            <SafeAreaWithAndroidPadding style={styles.container}>
                <View style={styles.header}>
                    {step > 1 && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>Let's get to know you</Text>
                        <Text style={[styles.subtitle, { color: colors.icon }]}>Step {step} of {totalSteps}</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                        {/* Step 1: Physical Stats */}
                        {step === 1 && (
                            <View style={styles.stepContainer}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Physical Details</Text>

                                <View style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <GlassInput
                                            placeholder="Age"
                                            value={formData.age}
                                            onChangeText={(t) => updateField('age', t)}
                                            icon="calendar-outline"
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={{ color: colors.text, marginBottom: 8, fontWeight: '600' }}>Gender</Text>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {(['Male', 'Female'] as const).map(g => (
                                                <TouchableOpacity
                                                    key={g}
                                                    onPress={() => updateField('gender', g)}
                                                    style={[styles.genderButton, {
                                                        backgroundColor: formData.gender === g ? colors.primary : colors.surfaceHighlight,
                                                    }]}
                                                >
                                                    <Text style={{ color: formData.gender === g ? 'white' : colors.text }}>{g[0]}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <GlassInput
                                    placeholder="Weight (kg)"
                                    value={formData.weight}
                                    onChangeText={(t) => updateField('weight', t)}
                                    icon="fitness-outline"
                                />
                                <GlassInput
                                    placeholder="Height (cm)"
                                    value={formData.height}
                                    onChangeText={(t) => updateField('height', t)}
                                    icon="resize-outline"
                                />
                            </View>
                        )}

                        {/* Step 2: Goal & Activity */}
                        {step === 2 && (
                            <View style={styles.stepContainer}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Goal</Text>
                                <View style={styles.optionsGrid}>
                                    <SelectionCard
                                        title="Lose Weight"
                                        selected={formData.goal === 'lose_weight'}
                                        onPress={() => updateField('goal', 'lose_weight')}
                                    />
                                    <SelectionCard
                                        title="Maintain Weight"
                                        selected={formData.goal === 'maintain_weight'}
                                        onPress={() => updateField('goal', 'maintain_weight')}
                                    />
                                    <SelectionCard
                                        title="Gain Muscle"
                                        selected={formData.goal === 'build_muscle'}
                                        onPress={() => updateField('goal', 'build_muscle')}
                                    />
                                </View>

                                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Activity Level</Text>
                                <View style={styles.optionsGrid}>
                                    <SelectionCard
                                        title="Sedentary"
                                        subtitle="Office job, little exercise"
                                        selected={formData.activityLevel === 'sedentary'}
                                        onPress={() => updateField('activityLevel', 'sedentary')}
                                    />
                                    <SelectionCard
                                        title="Moderately Active"
                                        subtitle="Exercise 3-5 times/week"
                                        selected={formData.activityLevel === 'moderately_active'}
                                        onPress={() => updateField('activityLevel', 'moderately_active')}
                                    />
                                    <SelectionCard
                                        title="Very Active"
                                        subtitle="Daily exercise/Physical job"
                                        selected={formData.activityLevel === 'very_active'}
                                        onPress={() => updateField('activityLevel', 'very_active')}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Step 3: Dietary Preferences */}
                        {step === 3 && (
                            <View style={styles.stepContainer}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Dietary Requirements</Text>

                                <Text style={[styles.subTitle, { color: colors.icon }]}>Diet Type</Text>
                                <View style={styles.optionsGrid}>
                                    {['Vegetarian', 'Vegan', 'Keto', 'Paleo'].map(diet => (
                                        <View key={diet}>
                                            <SelectionCard
                                                title={diet}
                                                selected={formData.dietaryRestrictions.includes(diet)}
                                                onPress={() => toggleSelection('dietaryRestrictions', diet)}
                                            />
                                        </View>
                                    ))}
                                </View>

                                <Text style={[styles.subTitle, { color: colors.icon, marginTop: 16 }]}>Allergies</Text>
                                <View style={styles.optionsGrid}>
                                    {['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Soy'].map(allergy => (
                                        <View key={allergy}>
                                            <SelectionCard
                                                title={allergy}
                                                selected={formData.allergies.includes(allergy)}
                                                onPress={() => toggleSelection('allergies', allergy)}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                    </KeyboardAvoidingView>
                </ScrollView>

                <View style={styles.footer}>
                    <PrimaryButton
                        title={step === totalSteps ? "Finish Setup" : "Next Step"}
                        onPress={handleNext}
                    />
                </View>
            </SafeAreaWithAndroidPadding>
        </ThemedBackground>
    );
}

// Wrapper for SafeArea spacing on Android
const SafeAreaWithAndroidPadding = ({ style, children }: any) => (
    <View style={[style, { paddingTop: Platform.OS === 'android' ? 40 : 0 }]}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    stepContainer: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    genderButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionsGrid: {
        gap: 12,
    },
    footer: {
        padding: 24,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    }
});
