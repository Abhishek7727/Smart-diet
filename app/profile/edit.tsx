import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    SafeAreaView,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '@/store/userSlice';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

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

    const InputField = ({ label, value, fieldKey, placeholder, keyboardType = 'default' }: any) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text }]}
                value={value}
                onChangeText={(text) => handleChange(fieldKey, text)}
                placeholder={placeholder}
                placeholderTextColor={colors.icon}
                keyboardType={keyboardType}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <InputField label="Full Name" value={formData.name} fieldKey="name" placeholder="John Doe" />

                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <InputField label="Age" value={formData.age} fieldKey="age" placeholder="25" keyboardType="numeric" />
                    </View>
                    <View style={styles.halfWidth}>
                        <InputField label="Calories Goal" value={formData.targetCalories} fieldKey="targetCalories" placeholder="2000" keyboardType="numeric" />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <InputField label="Weight (kg)" value={formData.weight} fieldKey="weight" placeholder="70" keyboardType="numeric" />
                    </View>
                    <View style={styles.halfWidth}>
                        <InputField label="Height (cm)" value={formData.height} fieldKey="height" placeholder="175" keyboardType="numeric" />
                    </View>
                </View>

                <InputField label="Fitness Goal" value={formData.goal} fieldKey="goal" placeholder="Lose Weight / Build Muscle" />

            </ScrollView>
        </SafeAreaView>
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
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    saveButton: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    halfWidth: {
        flex: 1,
    },
});
