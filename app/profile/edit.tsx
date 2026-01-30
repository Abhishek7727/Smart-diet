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
        weight: '',
        height: '',
        targetCalories: '',
        goal: '',
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                age: userData.age || '',
                weight: userData.weight || '',
                height: userData.height || '',
                targetCalories: userData.targetCalories || '',
                goal: userData.goal || '',
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
                    <ScrollView contentContainerStyle={styles.content}>
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
                                // keyboardType="numeric" // GlassInput needs prop update for this, strictly strings for now or update component
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <GlassInput
                                    placeholder="Goal (kcal)"
                                    value={formData.targetCalories}
                                    onChangeText={(text) => handleChange('targetCalories', text)}
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
                            placeholder="Fitness Goal"
                            value={formData.goal}
                            onChangeText={(text) => handleChange('goal', text)}
                            icon="trophy-outline"
                        />

                        <PrimaryButton title="Save Changes" onPress={handleSave} style={styles.saveButton} />

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
