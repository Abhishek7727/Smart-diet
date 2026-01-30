import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { register } from '@/store/userSlice';
import { Colors } from '@/constants/Colors';
import { ThemedBackground } from '@/components/ThemedBackground';
import { GlassInput } from '@/components/GlassInput';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const handleRegister = () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        dispatch(register({ name, email, password }));
        router.replace('/(tabs)');
    };

    return (
        <ThemedBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        Set up your profile to get personalized diet plans
                    </Text>
                </View>

                <View style={styles.form}>
                    <GlassInput
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                        icon="person-outline"
                    />
                    <GlassInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        icon="mail-outline"
                    />
                    <GlassInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        icon="lock-closed-outline"
                        secureTextEntry
                    />

                    <PrimaryButton title="Sign Up" onPress={handleRegister} style={styles.button} />

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.icon }]}>
                            Already have an account?
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/login')}>
                            <Text style={[styles.link, { color: colors.primary }]}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ThemedBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.8,
    },
    form: {
        width: '100%',
    },
    button: {
        marginTop: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        gap: 8,
    },
    footerText: {
        fontSize: 14,
    },
    link: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
