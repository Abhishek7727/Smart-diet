import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/store/userSlice';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

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

        // Check if user exists on device
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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        Login to access your plan
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={[styles.inputContainer, { backgroundColor: colors.surfaceHighlight }]}>
                        <Ionicons name="mail-outline" size={20} color={colors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Email"
                            placeholderTextColor={colors.icon}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={[styles.inputContainer, { backgroundColor: colors.surfaceHighlight }]}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Password"
                            placeholderTextColor={colors.icon}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleLogin}
                    >
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.icon }]}>
                            Don't have an account?
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/register')}>
                            <Text style={[styles.link, { color: colors.primary }]}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 24,
        zIndex: 1,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
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
