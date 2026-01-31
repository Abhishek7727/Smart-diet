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
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/store/userSlice';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { GlassInput } from '@/components/GlassInput';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const router = useRouter();
    const userData = useSelector((state: any) => state.user);
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        if (!userData.email || !userData.password) {
            Alert.alert('Account Not Found', 'No account found on this device. Please register first.');
            return;
        }

        if (userData.email.toLowerCase() === email.toLowerCase() && userData.password === password) {
            dispatch(loginSuccess());
            router.replace('/(tabs)');
        } else {
            Alert.alert('Error', 'Invalid credentials');
        }
    };

    return (
        <ScreenWrapper style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Login</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        Welcome Back
                    </Text>
                    <Text style={[styles.description, { color: colors.icon }]}>
                        Login to continue your journey.
                    </Text>
                </View>

                <View style={styles.form}>
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

                    <PrimaryButton title="Log In" onPress={handleLogin} style={styles.button} />

                    <TouchableOpacity style={styles.forgotButton}>
                        <Text style={[styles.forgotText, { color: colors.icon }]}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.icon }]}>
                            Don't have an account?
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/register')}>
                            <Text style={[styles.link, { color: colors.primary }]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
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
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.8,
    },
    form: {
        width: '100%',
    },
    button: {
        marginTop: 24,
    },
    forgotButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    forgotText: {
        fontSize: 14,
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
