import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react-native';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        await login(email, password);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <View style={styles.logoInner}>
                                    <Text style={styles.logoLetter}>M</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.title}>MovieMate</Text>
                        <Text style={styles.subtitle}>Cinematic experience at your fingertips</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.welcomeText}>Login to Continue</Text>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Mail color="#64748B" size={20} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor="#64748B"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Lock color="#64748B" size={20} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#64748B"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        {/* <TouchableOpacity style={styles.forgotPass}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity> */}

                        <TouchableOpacity
                            style={styles.loginBtn}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.loginBtnText}>Sign In</Text>
                                    <View style={styles.btnIconCircle}>
                                        <ArrowRight color="#6366F1" size={18} />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.signupText}>Create One</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    scrollContent: { flexGrow: 1, padding: 30, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 50 },
    logoContainer: { marginBottom: 20 },
    logoCircle: { width: 80, height: 80, borderRadius: 30, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
    logoInner: { width: 50, height: 50, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    logoLetter: { color: '#fff', fontSize: 32, fontWeight: '900' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
    subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 8, textAlign: 'center' },

    form: { backgroundColor: '#161B2E', padding: 25, borderRadius: 32, borderWidth: 1, borderColor: '#1F2937' },
    welcomeText: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 25, textAlign: 'center' },
    inputContainer: { marginBottom: 18 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0F1D', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#1F2937' },
    input: { flex: 1, marginLeft: 12, color: '#fff', fontSize: 15 },
    forgotPass: { alignSelf: 'flex-end', marginBottom: 25 },
    forgotText: { color: '#6366F1', fontSize: 13, fontWeight: '600' },

    loginBtn: { backgroundColor: '#6366F1', padding: 6, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20 },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    btnIconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: '#94A3B8', fontSize: 14 },
    signupText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});

export default LoginScreen;
