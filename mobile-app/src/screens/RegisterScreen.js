import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react-native';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const { register } = useContext(AuthContext);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Missing Fields', 'Please fill in all details!');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setLocalLoading(true);
        const result = await register(name, email, password);
        setLocalLoading(false);

        if (result.success) {
            if (Platform.OS === 'web') {
                window.alert('Account created successfully! Please login.');
                navigation.navigate('Login');
            } else {
                Alert.alert('Success', 'Account created! Please login.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            }
        } else {
            setError(result.error);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <UserPlus color="#fff" size={40} />
                    </View>
                    <Text style={styles.title}>Join MovieMate</Text>
                    <Text style={styles.subtitle}>Create an account to explore the world of cinema</Text>
                </View>

                <View style={styles.form}>
                    {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <User color="#64748B" size={20} style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="e.g. John Doe"
                                placeholderTextColor="#475569"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputWrapper}>
                            <Mail color="#64748B" size={20} style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="name@email.com"
                                placeholderTextColor="#475569"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Lock color="#64748B" size={20} style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Min. 6 characters"
                                placeholderTextColor="#475569"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.registerButton}
                        onPress={handleRegister}
                        disabled={localLoading}
                    >
                        {localLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.registerButtonText}>Register Now</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 60 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#161B2E', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    header: { alignItems: 'center', marginBottom: 40 },
    iconContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 10, shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 10 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: '#94A3B8', marginTop: 10, textAlign: 'center', lineHeight: 22 },
    form: { backgroundColor: '#161B2E', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#1F2937' },
    errorBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
    errorText: { color: '#EF4444', textAlign: 'center', fontSize: 13, fontWeight: '500' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#94A3B8', marginBottom: 10, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0F1D', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#1F2937' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: 56, color: '#fff', fontSize: 15 },
    registerButton: { backgroundColor: '#6366F1', borderRadius: 18, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 5, shadowColor: '#6366F1', shadowOpacity: 0.2, shadowRadius: 5 },
    registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: '#94A3B8', fontSize: 14 },
    footerLink: { color: '#6366F1', fontWeight: 'bold', fontSize: 14 }
});

export default RegisterScreen;
