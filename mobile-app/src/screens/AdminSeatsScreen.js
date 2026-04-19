import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { ArrowLeft, Armchair, Plus, Trash2, Camera, Info, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import BASE_URL from '../utils/constants';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

const AdminSeatsScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [seatLayout, setSeatLayout] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingType, setUpdatingType] = useState(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchSeatLayout(), fetchCategories()]);
            setLoading(false);
        };
        init();
        
        const unsubscribe = navigation.addListener('focus', () => {
            init();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/seats/categories');
            setCategories(res.data.data);
        } catch (err) {
            console.log('Failed to fetch categories');
        }
    };

    const updateCategoryPhoto = async (type) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            setUpdatingType(type);
            const formData = new FormData();
            if (Platform.OS === 'web') {
                const res = await fetch(result.assets[0].uri);
                const blob = await res.blob();
                formData.append('seatImage', blob, 'category.jpg');
            } else {
                formData.append('seatImage', { uri: result.assets[0].uri, name: 'category.jpg', type: 'image/jpeg' });
            }

            try {
                await api.put(`/seats/categories/${type}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
                });
                fetchCategories();
                if (Platform.OS === 'web') window.alert(`${type} image updated!`);
            } catch (err) {
                Alert.alert('Error', 'Failed to upload photo');
            } finally {
                setUpdatingType(null);
            }
        }
    };

    const fetchSeatLayout = async () => {
        try {
            const res = await api.get('/seats');
            setSeatLayout(res.data.data);
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch seat configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const executeDelete = async () => {
            try {
                const res = await api.delete(`/seats/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    fetchSeatLayout();
                    if (Platform.OS === 'web') window.alert('Row deleted successfully');
                }
            } catch (err) {
                const errorMsg = err.response?.data?.error || 'Failed to delete row';
                if (Platform.OS === 'web') {
                    window.alert(errorMsg);
                } else {
                    Alert.alert('Delete Validation', errorMsg);
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this row?')) executeDelete();
        } else {
            Alert.alert('Delete', 'Delete this row?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: executeDelete }
            ]);
        }
    };

    const handleToggleStatus = async (row) => {
        const newStatus = row.status === 'Active' ? 'Maintenance' : 'Active';
        try {
            await api.put(`/seats/${row._id}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSeatLayout();
            if (Platform.OS === 'web') window.alert(`Row marked as ${newStatus}`);
        } catch (err) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const totalSeats = seatLayout.reduce((acc, curr) => acc + curr.seatsCount, 0);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seat Configurations</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddSeatRow')}>
                    <Plus color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Main Theatre Hall</Text>
                    <Text style={styles.summaryText}>Total Capacity: <Text style={{color: '#10B981', fontWeight: 'bold'}}>{totalSeats} Seats</Text></Text>
                </View>

                {/* Assignment Requirement: Global Category File Uploads */}
                <View style={{ marginBottom: 30 }}>
                    <View style={styles.assignmentHeader}>
                        <Info color="#6366F1" size={14} />
                        <Text style={styles.assignmentTitle}>Seat Category Previews (Admin Requirement)</Text>
                    </View>
                    
                    <View style={styles.categoryRow}>
                        {['Normal', 'VIP'].map(type => {
                            const cat = categories.find(c => c.type === type);
                            return (
                                <TouchableOpacity 
                                    key={type} 
                                    style={styles.catCard}
                                    onPress={() => updateCategoryPhoto(type)}
                                    disabled={updatingType === type}
                                >
                                    {updatingType === type ? <ActivityIndicator color="#6366F1" /> : (
                                        <>
                                            <Image 
                                                source={{ uri: cat?.image ? (cat?.image?.startsWith('default') ? `https://placehold.jp/24/6366f1/ffffff/150x150.png?text=${type}` : `${BASE_URL}/uploads/seats/${cat.image}`) : `https://placehold.jp/24/6366f1/ffffff/150x150.png?text=${type}` }} 
                                                style={styles.catImg}
                                            />
                                            <View style={styles.catOverlay}>
                                                <Camera color="#fff" size={16} />
                                                <Text style={styles.catLabel}>{type}</Text>
                                            </View>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={styles.sectionTitle}>Seat Rows Overview</Text>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>Long press a row to toggle Maintenance</Text>
                </View>

                {loading ? <ActivityIndicator size="large" color="#3B82F6" /> : seatLayout.map((row) => (
                    <TouchableOpacity 
                        key={row._id} 
                        style={[styles.rowCard, row.status === 'Maintenance' && { borderColor: '#EF4444', opacity: 0.8 }]}
                        onLongPress={() => handleToggleStatus(row)}
                        delayLongPress={500}
                    >
                        <View style={styles.rowHeader}>
                            <Armchair color={row.type === 'VIP' ? '#F59E0B' : '#3B82F6'} size={24} />
                            <Text style={styles.rowName}>Row {row.rowCode}</Text>
                        </View>
                        <View style={styles.rowDetails}>
                            {row.status === 'Maintenance' && (
                                <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                    <Text style={[styles.badgeText, { color: '#EF4444' }]}>Maintenance</Text>
                                </View>
                            )}
                            <View style={styles.badge}>
                                <Text style={[styles.badgeText, row.type === 'VIP' && { color: '#F59E0B' }]}>{row.type}</Text>
                            </View>
                            <Text style={styles.detailText}>{row.seatsCount} Seats</Text>
                            {row.type === 'VIP' && <Text style={styles.bonusText}>(+ Rs.{row.extraPrice})</Text>}
                            
                            <TouchableOpacity onPress={() => navigation.navigate('EditSeatRow', { row: row })} style={{ marginLeft: 15 }}>
                                <Text style={{ color: '#3B82F6', fontSize: 18 }}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(row._id)} style={{ marginLeft: 15 }}>
                                <Trash2 color="#EF4444" size={18} />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 20, backgroundColor: '#161B2E', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    addButton: { padding: 10, backgroundColor: '#6366F1', borderRadius: 12 },
    content: { padding: 20 },
    summaryCard: { backgroundColor: '#161B2E', padding: 24, borderRadius: 32, marginBottom: 30, alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' },
    summaryTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    summaryText: { fontSize: 16, color: '#94A3B8' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    rowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161B2E', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' },
    rowHeader: { flexDirection: 'row', alignItems: 'center' },
    rowName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginLeft: 12 },
    rowDetails: { flexDirection: 'row', alignItems: 'center' },
    badge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 10 },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: '#6366F1' },
    bonusText: { color: '#F59E0B', fontSize: 12, marginLeft: 10 },
    assignmentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: 'rgba(99, 102, 241, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    assignmentTitle: { color: '#6366F1', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 6 },
    categoryRow: { flexDirection: 'row' },
    catCard: { flex: 1, height: 100, borderRadius: 20, overflow: 'hidden', backgroundColor: '#161B2E', borderWidth: 1, borderColor: '#1F2937', justifyContent: 'center', alignItems: 'center', marginHorizontal: 7 },
    catImg: { width: '100%', height: '100%', opacity: 0.5 },
    catOverlay: { position: 'absolute', alignItems: 'center' },
    catLabel: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 4 }
});

export default AdminSeatsScreen;
