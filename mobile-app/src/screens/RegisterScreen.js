import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react-native';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');

    const { register } = useContext(AuthContext);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setError('');
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
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <UserPlus color="#fff" size={40} />
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join MovieMate to start booking movies!</Text>
                </View>

                <View style={styles.form}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="e.g. John Doe"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="e.g. name@email.com"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Min. 6 characters"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
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
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#10B981', // Emerald/Green
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 8,
        textAlign: 'center',
    },
    form: {
        backgroundColor: '#1E293B',
        padding: 24,
        borderRadius: 24,
    },
    errorText: {
        color: '#F87171',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 13,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#CBD5E1',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#0F172A',
        borderRadius: 14,
        padding: 16,
        color: '#fff',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    registerButton: {
        backgroundColor: '#10B981',
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    footerLink: {
        color: '#10B981',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default RegisterScreen;
