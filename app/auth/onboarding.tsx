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
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { GlassInput } from '@/components/GlassInput';
import { GlassDropdown } from '@/components/GlassDropdown';
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

    const calculateTargetCalories = () => {
        // Basic BMR Calculation (Mifflin-St Jeor)
        const weight = parseFloat(formData.weight) || 70;
        const height = parseFloat(formData.height) || 170;
        const age = parseFloat(formData.age) || 25;

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

        let tdee = bmr * (multipliers[formData.activityLevel] || 1.2);

        // Goal Adjustment
        if (formData.goal === 'lose_weight') tdee -= 500;
        else if (formData.goal === 'gain_weight' || formData.goal === 'build_muscle') tdee += 500;

        return Math.round(tdee).toString();
    };

    const handleFinish = () => {
        if (!formData.age || !formData.weight || !formData.height) {
            Alert.alert('Missing Info', 'Please fill in your Age, Weight, and Height.');
            return;
        }

        const targetCalories = calculateTargetCalories();

        dispatch(updateProfile({
            ...formData,
            targetCalories,
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

    const SelectableChip = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
        <TouchableOpacity
            style={[styles.chip, {
                backgroundColor: selected ? colors.primary : colors.surfaceHighlight,
                borderColor: selected ? colors.primary : colors.glass.borderColor,
                borderWidth: 1,
            }]}
            onPress={onPress}
        >
            <Text style={[styles.chipText, { color: selected ? '#fff' : colors.text }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Setup Profile</Text>
                <Text style={[styles.subtitle, { color: colors.icon }]}>Personalize your diet plan</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Section 1: Stats */}
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Physical Details</Text>

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
                            <GlassDropdown
                                label="Gender"
                                value={formData.gender}
                                options={[
                                    { label: 'Male', value: 'Male' },
                                    { label: 'Female', value: 'Female' },
                                    { label: 'Other', value: 'Other' },
                                ]}
                                onSelect={(v) => updateField('gender', v)}
                                icon="person-outline"
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <GlassInput
                                placeholder="Weight (kg)"
                                value={formData.weight}
                                onChangeText={(t) => updateField('weight', t)}
                                icon="fitness-outline"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <GlassInput
                                placeholder="Height (cm)"
                                value={formData.height}
                                onChangeText={(t) => updateField('height', t)}
                                icon="resize-outline"
                            />
                        </View>
                    </View>

                    {/* Section 2: Goals */}
                    <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 12 }]}>Goals & Lifestyle</Text>

                    <GlassDropdown
                        label="Your Goal"
                        value={formData.goal}
                        icon="trophy-outline"
                        options={[
                            { label: 'Lose Weight', value: 'lose_weight' },
                            { label: 'Maintain Weight', value: 'maintain_weight' },
                            { label: 'Build Muscle', value: 'build_muscle' },
                            { label: 'Gain Weight', value: 'gain_weight' },
                            { label: 'Improve Health', value: 'improve_health' },
                        ]}
                        onSelect={(v) => updateField('goal', v)}
                    />

                    <GlassDropdown
                        label="Activity Level"
                        value={formData.activityLevel}
                        icon="walk-outline"
                        options={[
                            { label: 'Sedentary', value: 'sedentary', subtitle: 'Little to no exercise' },
                            { label: 'Lightly Active', value: 'lightly_active', subtitle: 'Exercise 1-3 times/week' },
                            { label: 'Moderately Active', value: 'moderately_active', subtitle: 'Exercise 3-5 times/week' },
                            { label: 'Very Active', value: 'very_active', subtitle: 'Exercise 6-7 times/week' },
                            { label: 'Extra Active', value: 'extra_active', subtitle: 'Very intense exercise daily' },
                        ]}
                        onSelect={(v) => updateField('activityLevel', v)}
                    />

                    {/* Section 3: Preferences */}
                    <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 12 }]}>Preferences</Text>

                    <Text style={[styles.label, { color: colors.icon }]}>Dietary Restrictions</Text>
                    <View style={styles.chipContainer}>
                        {['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Pescatarian'].map(diet => (
                            <View key={diet}>
                                <SelectableChip
                                    label={diet}
                                    selected={formData.dietaryRestrictions.includes(diet)}
                                    onPress={() => toggleSelection('dietaryRestrictions', diet)}
                                />
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: colors.icon, marginTop: 16 }]}>Allergies</Text>
                    <View style={styles.chipContainer}>
                        {['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Shellfish'].map(allergy => (
                            <View key={allergy}>
                                <SelectableChip
                                    label={allergy}
                                    selected={formData.allergies.includes(allergy)}
                                    onPress={() => toggleSelection('allergies', allergy)}
                                />
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 40 }} />
                    <PrimaryButton title="Create Profile" onPress={handleFinish} />
                    <View style={{ height: 100 }} />

                </ScrollView>
            </KeyboardAvoidingView >
        </ScreenWrapper >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 20,
        marginTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    content: {
        paddingHorizontal: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
