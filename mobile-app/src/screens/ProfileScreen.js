import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, ScrollView, StatusBar, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { User, Mail, LogOut, ArrowLeft, Camera, Shield, HelpCircle } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

const ProfileScreen = ({ navigation }) => {
    const { logout, user, token, loadUser } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleUpdate = async () => {
        if (!name || !email) {
            Alert.alert('Error', 'Fields cannot be empty');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/updatedetails', { name, email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', 'Profile updated successfully');
            loadUser(); // Refresh user context
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <LogOut color="#EF4444" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={styles.userName}>{name}</Text>
                    <View style={styles.badge}>
                        <Shield color="#6366F1" size={12} />
                        <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.sectionLabel}>Account Settings</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <User color="#64748B" size={18} />
                            <TextInput 
                                style={styles.input} 
                                value={name} 
                                onChangeText={setName}
                                placeholderTextColor="#64748B"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <View style={styles.inputWrapper}>
                            <Mail color="#64748B" size={18} />
                            <TextInput 
                                style={styles.input} 
                                value={email} 
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#64748B"
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.updateBtn} 
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateBtnText}>Save Changes</Text>}
                    </TouchableOpacity>
                </View>

                <View style={[styles.formCard, { marginTop: 20 }]}>
                    <Text style={styles.sectionLabel}>Preferences</Text>
                    
                    <TouchableOpacity style={[styles.prefRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.prefIconWrapper}>
                            <HelpCircle color="#F59E0B" size={18} />
                        </View>
                        <Text style={styles.prefText}>Help & Support</Text>
                        <ArrowLeft color="#64748B" size={16} style={{ transform: [{ rotate: '180deg'}]}} />
                    </TouchableOpacity>
                </View>
                <View style={{ height: 120 }} />
            </ScrollView>
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 25, 
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        paddingBottom: 20
    },
    headerTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
    backBtn: { 
        padding: 12, 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.08)' 
    },
    logoutBtn: { 
        padding: 12, 
        backgroundColor: 'rgba(239, 68, 68, 0.05)', 
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.1)'
    },
    content: { padding: 25, paddingTop: 10 },
    profileSection: { alignItems: 'center', marginBottom: 40 },
    avatarContainer: { width: 110, height: 110, marginBottom: 20 },
    avatar: { 
        width: 110, 
        height: 110, 
        borderRadius: 45, 
        backgroundColor: '#6366F1', 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    avatarText: { color: '#fff', fontSize: 42, fontWeight: '900' },
    editAvatar: { 
        position: 'absolute', 
        bottom: 0, 
        right: 0, 
        backgroundColor: '#030712', 
        padding: 10, 
        borderRadius: 15, 
        borderWidth: 2, 
        borderColor: 'rgba(255,255,255,0.1)' 
    },
    userName: { color: '#F8FAFC', fontSize: 26, fontWeight: '900', marginBottom: 10, letterSpacing: -0.5 },
    badge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'rgba(99, 102, 241, 0.1)', 
        paddingHorizontal: 16, 
        paddingVertical: 6, 
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)'
    },
    roleText: { color: '#818CF8', fontSize: 11, fontWeight: '900', marginLeft: 8, letterSpacing: 1 },
    
    formCard: { 
        backgroundColor: '#0F172A', 
        padding: 25, 
        borderRadius: 35, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8
    },
    sectionLabel: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginBottom: 25, letterSpacing: -0.2 },
    inputGroup: { marginBottom: 25 },
    inputLabel: { color: '#64748B', fontSize: 12, fontWeight: '800', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
    inputWrapper: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#030712', 
        paddingHorizontal: 18, 
        paddingVertical: 16, 
        borderRadius: 22, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.05)' 
    },
    input: { flex: 1, marginLeft: 15, color: '#fff', fontSize: 15, fontWeight: '700' },
    updateBtn: { 
        backgroundColor: '#10B981', 
        padding: 20, 
        borderRadius: 22, 
        alignItems: 'center', 
        marginTop: 10,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8
    },
    updateBtnText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
    
    prefRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 18, 
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(255,255,255,0.03)' 
    },
    prefIconWrapper: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        backgroundColor: 'rgba(245, 158, 11, 0.05)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 18 
    },
    prefText: { flex: 1, color: '#CBD5E1', fontSize: 16, fontWeight: '700' }
});

export default ProfileScreen;
