import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Alert, SafeAreaView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Plus, Edit, Trash2, ShoppingBasket } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';
import BASE_URL from '../utils/constants';
import BottomNav from '../components/BottomNav';

const AdminSnackManagementScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [snacks, setSnacks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSnacks = async () => {
        try {
            const res = await api.get('/snacks');
            setSnacks(res.data.data);
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch snacks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSnacks();
        const unsubscribe = navigation.addListener('focus', fetchSnacks);
        return unsubscribe;
    }, [navigation]);

    const handleDelete = (id) => {
        const executeDelete = async () => {
            try {
                await api.delete(`/snacks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchSnacks();
            } catch (err) {
                Alert.alert('Error', 'Failed to delete snack');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this snack?')) executeDelete();
        } else {
            Alert.alert('Delete', 'Delete this snack?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: executeDelete }
            ]);
        }
    };

    const renderSnack = ({ item }) => (
        <View style={styles.card}>
            <Image 
                source={{ uri: `${BASE_URL}/uploads/snacks/${item.image}` }} 
                style={styles.snackImage} 
            />
            <View style={styles.snackInfo}>
                <View style={styles.row}>
                    <Text style={styles.snackName}>{item.name}</Text>
                    <View style={[styles.availabilityBadge, !item.isAvailable && { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                        <Text style={[styles.availabilityText, !item.isAvailable && { color: '#EF4444' }]}>
                            {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.snackPrice}>Rs. {item.price}</Text>
                
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={styles.editBtn} 
                        onPress={() => navigation.navigate('AdminAddSnack', { snack: item })}
                    >
                        <Edit color="#3B82F6" size={18} />
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                        <Trash2 color="#EF4444" size={18} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Snack Menu</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AdminAddSnack')}>
                    <Plus color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ padding: 20 }}>
                    {[1,2,3,4].map(i => (
                        <View key={i} style={styles.skeletonCard}>
                            <SkeletonLoader width={80} height={80} borderRadius={12} />
                            <View style={{ flex: 1, marginLeft: 15 }}>
                                <SkeletonLoader width="60%" height={20} borderRadius={6} style={{ marginBottom: 10 }} />
                                <SkeletonLoader width="40%" height={15} borderRadius={4} />
                            </View>
                        </View>
                    ))}
                </View>
            ) : snacks.length === 0 ? (
                <View style={styles.center}>
                    <ShoppingBasket color="#334155" size={60} />
                    <Text style={styles.emptyText}>No snacks added yet.</Text>
                    <TouchableOpacity style={[styles.addButton, { marginTop: 20, paddingHorizontal: 20 }]} onPress={() => navigation.navigate('AdminAddSnack')}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add First Snack</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={snacks}
                    keyExtractor={(item) => item._id}
                    renderItem={renderSnack}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
                />
            )}
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 20, backgroundColor: '#161B2E', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    addButton: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#6366F1', borderRadius: 12 },
    listContent: { padding: 20 },
    card: { backgroundColor: '#161B2E', borderRadius: 24, marginBottom: 16, flexDirection: 'row', padding: 12, borderWidth: 1, borderColor: '#1F2937' },
    snackImage: { width: 90, height: 90, borderRadius: 16 },
    snackInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    snackName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    availabilityBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    availabilityText: { color: '#10B981', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    snackPrice: { fontSize: 17, fontWeight: 'bold', color: '#10B981', marginBottom: 10 },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
    editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 10 },
    editBtnText: { color: '#6366F1', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
    deleteBtn: { padding: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 },
    skeletonCard: { flexDirection: 'row', backgroundColor: '#161B2E', padding: 12, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1F2937' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#64748B', fontSize: 16, marginTop: 10 }
});

export default AdminSnackManagementScreen;
