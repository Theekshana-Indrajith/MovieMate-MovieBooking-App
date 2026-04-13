import React, { useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react-native';

const HomeScreen = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.name}>{user?.name || 'User'}</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.userIcon}>
                        <User color="#3B82F6" size={40} />
                    </View>
                    <Text style={styles.infoTitle}>Profile Information</Text>
                    <Text style={styles.infoText}>Email: {user?.email}</Text>
                    <Text style={styles.infoText}>Role: {user?.role}</Text>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <LogOut color="#fff" size={20} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
    },
    greeting: {
        fontSize: 20,
        color: '#94A3B8',
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    card: {
        backgroundColor: '#1E293B',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 30,
    },
    userIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 4,
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#EF4444', // Red
        padding: 18,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    }
});

export default HomeScreen;
