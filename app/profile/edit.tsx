import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '@/store/userSlice';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ThemedBackground } from '@/components/ThemedBackground';
import { GlassInput } from '@/components/GlassInput';
import { GlassDropdown } from '@/components/GlassDropdown';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function EditProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.user);
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        weight: '',
        height: '',
        targetCalories: '',
        goal: '',
        activityLevel: '',
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                age: userData.age || '',
                gender: userData.gender || 'Male',
                weight: userData.weight || '',
                height: userData.height || '',
                targetCalories: userData.targetCalories || '',
                goal: userData.goal || 'lose_weight',
                activityLevel: userData.activityLevel || 'moderately_active',
            });
        }
    }, [userData]);

    const handleChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        if (!formData.name) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        dispatch(updateProfile(formData));
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
    };

    return (
        <ThemedBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save</Text>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                        <GlassInput
                            placeholder="Full Name"
                            value={formData.name}
                            onChangeText={(text) => handleChange('name', text)}
                            icon="person-outline"
                        />

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <GlassInput
                                    placeholder="Age"
                                    value={formData.age}
                                    onChangeText={(text) => handleChange('age', text)}
                                // icon="calendar-outline"
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <GlassDropdown
                                    label="Gender"
                                    value={formData.gender}
                                    options={[
                                        { label: 'Male', value: 'Male' },
                                        { label: 'Female', value: 'Female' },
                                        { label: 'Other', value: 'Other' },
                                    ]}
                                    onSelect={(v) => handleChange('gender', v)}
                                // icon="person-outline"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <GlassInput
                                    placeholder="Weight (kg)"
                                    value={formData.weight}
                                    onChangeText={(text) => handleChange('weight', text)}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <GlassInput
                                    placeholder="Height (cm)"
                                    value={formData.height}
                                    onChangeText={(text) => handleChange('height', text)}
                                />
                            </View>
                        </View>

                        <GlassInput
                            placeholder="Target Calories (kcal)"
                            value={formData.targetCalories}
                            onChangeText={(text) => handleChange('targetCalories', text)}
                            icon="flame-outline"
                        />

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
                            onSelect={(v) => handleChange('goal', v)}
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
                            onSelect={(v) => handleChange('activityLevel', v)}
                        />

                        <PrimaryButton title="Save Changes" onPress={handleSave} style={styles.saveButton} />

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    saveButtonText: {
        fontWeight: '700',
        fontSize: 16,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        padding: 24,
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    halfWidth: {
        flex: 1,
    },
    saveButton: {
        marginTop: 24,
    }
});
